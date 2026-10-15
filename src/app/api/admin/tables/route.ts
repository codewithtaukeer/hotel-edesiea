import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tables = await prisma.diningTable.findMany({
      include: {
        reservations: {
          where: {
            status: { in: ["CONFIRMED", "SEATED"] },
          },
          orderBy: { timeSlot: "asc" },
        },
        orders: {
          where: {
            status: { in: ["PENDING", "KITCHEN_PREPARING", "READY", "SERVED"] },
          },
        },
      },
      orderBy: { tableNumber: "asc" },
    });

    return NextResponse.json({ tables });
  } catch (error: any) {
    console.error("Get tables error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session || !hasPermission(session.roles, "tables:manage")) {
      return NextResponse.json(
        { error: "Forbidden: Tables management permission required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, tableId, status } = body;

    if (action === "UPDATE_STATUS") {
      const updated = await prisma.diningTable.update({
        where: { id: tableId },
        data: { status },
      });
      return NextResponse.json({ success: true, table: updated });
    }

    return NextResponse.json({ error: "Invalid table action" }, { status: 400 });
  } catch (error: any) {
    console.error("Table action error:", error);
    return NextResponse.json(
      { error: "Failed to process table action" },
      { status: 500 }
    );
  }
}
