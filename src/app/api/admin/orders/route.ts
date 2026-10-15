import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const orders = await prisma.restaurantOrder.findMany({
      where,
      include: {
        table: true,
        booking: {
          include: { guest: true },
        },
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session || !hasPermission(session.roles, "orders:create")) {
      return NextResponse.json(
        { error: "Forbidden: Orders creation permission required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      tableId,
      bookingId,
      orderType = "DINE_IN", // DINE_IN, ROOM_SERVICE, TAKEAWAY
      items = [], // [{ menuItemId, quantity, specialInstructions }]
      stewardName,
      billToRoomFolio = false,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "At least one menu item is required" },
        { status: 400 }
      );
    }

    // Atomic transaction for order creation, price validation & GST calculation
    const createdOrder = await prisma.$transaction(async (tx) => {
      // 1. Fetch real prices from database
      const itemIds = items.map((i: any) => i.menuItemId);
      const dbItems = await tx.menuItem.findMany({
        where: { id: { in: itemIds } },
      });

      const dbItemMap = new Map(dbItems.map((item) => [item.id, item]));

      let subTotal = 0.0;
      const verifiedOrderItems = [];

      for (const reqItem of items) {
        const dbItem = dbItemMap.get(reqItem.menuItemId);
        if (!dbItem) {
          throw new Error(`Menu item ${reqItem.menuItemId} not found`);
        }

        const qty = Math.max(1, parseInt(reqItem.quantity, 10) || 1);
        const itemTotal = dbItem.price * qty;
        subTotal += itemTotal;

        verifiedOrderItems.push({
          menuItemId: dbItem.id,
          itemName: dbItem.name,
          unitPrice: dbItem.price,
          quantity: qty,
          specialInstructions: reqItem.specialInstructions || null,
          totalPrice: itemTotal,
        });
      }

      // 2. Calculate Statutory GST (5% = 2.5% CGST + 2.5% SGST as per bill EAR_649)
      const cgst = parseFloat((subTotal * 0.025).toFixed(2));
      const sgst = parseFloat((subTotal * 0.025).toFixed(2));
      const grandTotal = Math.round(subTotal + cgst + sgst);

      // 3. Generate authentic receipt number EAR_XXX
      const randomSeq = Math.floor(650 + Math.random() * 3000);
      const orderNumber = `EAR_${randomSeq}`;

      // 4. Create Restaurant Order
      const newOrder = await tx.restaurantOrder.create({
        data: {
          tableId: tableId || null,
          bookingId: bookingId || null,
          orderNumber,
          orderType,
          status: "PENDING", // Sent to KOT kitchen display
          subTotal,
          cgst,
          sgst,
          grandTotal,
          stewardName: stewardName || session.name || "Steward",
          items: {
            create: verifiedOrderItems,
          },
        },
        include: { items: true, table: true },
      });

      // 5. Update table status if dine-in
      if (tableId) {
        await tx.diningTable.update({
          where: { id: tableId },
          data: { status: "OCCUPIED" },
        });
      }

      // 6. If Room Service and billing to Room Folio, create FolioEntry
      if (orderType === "ROOM_SERVICE" && bookingId && billToRoomFolio) {
        await tx.folioEntry.create({
          data: {
            bookingId,
            description: `Room Service: Order ${orderNumber}`,
            category: "RESTAURANT",
            amount: grandTotal,
            createdBy: session.name,
          },
        });

        // Add to room totalAmount & balanceDue
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            totalAmount: { increment: grandTotal },
            balanceDue: { increment: grandTotal },
          },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: createdOrder,
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create restaurant order" },
      { status: 500 }
    );
  }
}
