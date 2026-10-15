import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session || !hasPermission(session.roles, "reports:view")) {
      return NextResponse.json(
        { error: "Forbidden: Management reports access required" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetDate =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Compute start and end of target date in UTC
    const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDate}T23:59:59.999Z`);

    // 1. Fetch Room Payments for this date
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        status: "SUCCESS",
      },
      include: {
        booking: {
          include: { guest: true },
        },
      },
    });

    const roomCollections = payments.reduce((sum, p) => sum + p.amount, 0);

    // 2. Fetch Settled Restaurant Orders for this date
    const restaurantOrders = await prisma.restaurantOrder.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        status: { in: ["PAID", "SERVED"] },
      },
      include: {
        table: true,
        items: true,
      },
    });

    const restaurantSubtotal = restaurantOrders.reduce(
      (sum, o) => sum + o.subTotal,
      0
    );
    const restaurantCgst = restaurantOrders.reduce((sum, o) => sum + o.cgst, 0);
    const restaurantSgst = restaurantOrders.reduce((sum, o) => sum + o.sgst, 0);
    const restaurantTotalGst = restaurantCgst + restaurantSgst;
    const restaurantGross = restaurantOrders.reduce(
      (sum, o) => sum + o.grandTotal,
      0
    );

    // 3. Fetch Invoices issued on this date
    const invoices = await prisma.invoice.findMany({
      where: {
        issuedAt: { gte: startOfDay, lte: endOfDay },
      },
      include: { guest: true, booking: true },
    });

    const roomStayGst = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

    // 4. Fetch Operating Expenses on this date
    const expenses = await prisma.expense.findMany({
      where: {
        date: targetDate,
      },
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Group expenses by category
    const expensesByCategory: Record<string, number> = {};
    for (const exp of expenses) {
      expensesByCategory[exp.category] =
        (expensesByCategory[exp.category] || 0) + exp.amount;
    }

    // 5. Calculate Occupancy & ADR / RevPAR
    const totalPhysicalRooms = 12;

    // A room is occupied if checkInDate <= targetDate and checkOutDate > targetDate
    const activeBookings = await prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        checkInDate: { lte: targetDate },
        checkOutDate: { gt: targetDate },
      },
      include: { bookingRooms: true },
    });

    const occupiedRoomCount = Math.min(
      totalPhysicalRooms,
      activeBookings.reduce((sum, b) => sum + b.bookingRooms.length, 0)
    );

    const occupancyRate = parseFloat(
      ((occupiedRoomCount / totalPhysicalRooms) * 100).toFixed(1)
    );
    const adr =
      occupiedRoomCount > 0
        ? Math.round(roomCollections / occupiedRoomCount)
        : 0;
    const revPar = Math.round(roomCollections / totalPhysicalRooms);

    // 6. Payment Modes Breakdown
    const paymentMethods: Record<string, number> = {
      RAZORPAY: 0,
      UPI: 0,
      CASH: 0,
      CARD: 0,
      PAY_AT_HOTEL: 0,
    };

    for (const p of payments) {
      paymentMethods[p.method] = (paymentMethods[p.method] || 0) + p.amount;
    }

    const grossRevenue = roomCollections + restaurantGross;
    const totalTaxLiability = roomStayGst + restaurantTotalGst;
    const netOperatingProfit = grossRevenue - totalExpenses;

    return NextResponse.json({
      date: targetDate,
      kpis: {
        grossRevenue,
        roomCollections,
        restaurantGross,
        totalExpenses,
        netOperatingProfit,
        totalTaxLiability,
        occupancyRate,
        occupiedRoomCount,
        totalRooms: totalPhysicalRooms,
        adr,
        revPar,
      },
      taxes: {
        roomStayGst12: roomStayGst,
        restaurantCgst2_5: restaurantCgst,
        restaurantSgst2_5: restaurantSgst,
        totalRestaurantGst5: restaurantTotalGst,
        totalTaxLiability,
      },
      paymentMethods,
      expensesByCategory,
      paymentsCount: payments.length,
      restaurantOrdersCount: restaurantOrders.length,
      invoicesCount: invoices.length,
      expensesCount: expenses.length,
      expenses,
    });
  } catch (error: any) {
    console.error("Daily report API error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily settlement report" },
      { status: 500 }
    );
  }
}
