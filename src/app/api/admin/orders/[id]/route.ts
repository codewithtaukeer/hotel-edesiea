import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = params.id;
    const body = await request.json();
    const { status, paymentMethod = "CASH" } = body;

    const existingOrder = await prisma.restaurantOrder.findUnique({
      where: { id: orderId },
      include: { table: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.restaurantOrder.update({
        where: { id: orderId },
        data: { status },
      });

      // If order is PAID or CANCELLED, release the table
      if (
        (status === "PAID" || status === "CANCELLED") &&
        existingOrder.tableId
      ) {
        // Check if other active orders exist on this table
        const otherOrders = await tx.restaurantOrder.count({
          where: {
            tableId: existingOrder.tableId,
            id: { not: orderId },
            status: { in: ["PENDING", "KITCHEN_PREPARING", "READY", "SERVED"] },
          },
        });

        if (otherOrders === 0) {
          await tx.diningTable.update({
            where: { id: existingOrder.tableId },
            data: { status: "AVAILABLE" },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          actorId: session.userId,
          actorRole: session.roles.join(", "),
          action: "UPDATE_ORDER_STATUS",
          entity: "RestaurantOrder",
          entityId: orderId,
          detailsJson: JSON.stringify({ oldStatus: existingOrder.status, newStatus: status }),
        },
      });

      return order;
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
