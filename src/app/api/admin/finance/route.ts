import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session || !hasPermission(session.roles, "finance:view")) {
      return NextResponse.json(
        { error: "Forbidden: Accountant or Manager privileges required" },
        { status: 403 }
      );
    }

    const [payments, invoices, refunds, expenses, outstandingBookings] =
      await Promise.all([
        prisma.payment.findMany({
          include: { booking: { include: { guest: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.invoice.findMany({
          include: { guest: true, booking: true },
          orderBy: { issuedAt: "desc" },
          take: 50,
        }),
        prisma.refund.findMany({
          include: { booking: { include: { guest: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.expense.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.booking.findMany({
          where: {
            balanceDue: { gt: 0 },
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
          },
          include: { guest: true, bookingRooms: { include: { room: true } } },
          orderBy: { checkInDate: "asc" },
        }),
      ]);

    const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
    const totalRefunded = refunds.reduce((acc, r) => acc + r.amount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const totalOutstanding = outstandingBookings.reduce(
      (acc, b) => acc + b.balanceDue,
      0
    );

    return NextResponse.json({
      summary: {
        totalCollected,
        totalRefunded,
        netCollections: totalCollected - totalRefunded,
        totalExpenses,
        totalOutstanding,
      },
      payments,
      invoices,
      refunds,
      expenses,
      outstandingBookings,
    });
  } catch (error: any) {
    console.error("Finance API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch financial reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session || !hasPermission(session.roles, "expenses:manage")) {
      return NextResponse.json(
        { error: "Forbidden: Accountant or Manager privileges required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { category, payee, amount, paymentMethod, description, invoiceRef } =
      body;

    if (!category || !payee || !amount) {
      return NextResponse.json(
        { error: "Category, payee, and amount are required" },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        payee,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || "CASH",
        description: description || "Operating expense",
        invoiceRef: invoiceRef || null,
        approvedBy: session.name,
        date: new Date().toISOString().split("T")[0],
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorRole: session.roles.join(", "),
        action: "RECORD_EXPENSE",
        entity: "Expense",
        entityId: expense.id,
        detailsJson: JSON.stringify(expense),
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    console.error("Record expense error:", error);
    return NextResponse.json(
      { error: "Failed to record expense" },
      { status: 500 }
    );
  }
}
