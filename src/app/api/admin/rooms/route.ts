import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rooms = await prisma.physicalRoom.findMany({
      include: {
        category: true,
        bookingRooms: {
          where: {
            booking: {
              status: { in: ["CONFIRMED", "CHECKED_IN"] },
            },
          },
          include: {
            booking: {
              include: { guest: true },
            },
          },
        },
      },
      orderBy: { roomNumber: "asc" },
    });

    const categories = await prisma.roomCategory.findMany({
      orderBy: { basePrice: "asc" },
    });

    return NextResponse.json({ rooms, categories });
  } catch (error: any) {
    console.error("Get rooms error:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, roomId, categoryId, newRate, housekeepingStatus, operationalStatus } = body;

    // 1. UPDATE ROOM CATEGORY PRICE
    if (action === "UPDATE_CATEGORY_PRICE") {
      if (!hasPermission(session.roles, "rooms:manage")) {
        return NextResponse.json({ error: "Forbidden: Rooms management required" }, { status: 403 });
      }

      const updated = await prisma.roomCategory.update({
        where: { id: categoryId },
        data: { basePrice: parseFloat(newRate) },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          actorRole: session.roles.join(", "),
          action: "UPDATE_ROOM_RATE",
          entity: "RoomCategory",
          entityId: categoryId,
          detailsJson: JSON.stringify({ newRate }),
        },
      });

      return NextResponse.json({ success: true, category: updated });
    }

    // 2. UPDATE PHYSICAL ROOM STATUS
    if (action === "UPDATE_ROOM_STATUS") {
      const dataToUpdate: any = {};
      if (housekeepingStatus) dataToUpdate.housekeepingStatus = housekeepingStatus;
      if (operationalStatus) {
        if (!hasPermission(session.roles, "rooms:block")) {
          return NextResponse.json({ error: "Forbidden: Cannot block/unblock rooms" }, { status: 403 });
        }
        dataToUpdate.operationalStatus = operationalStatus;
      }

      const updatedRoom = await prisma.physicalRoom.update({
        where: { id: roomId },
        data: dataToUpdate,
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          actorRole: session.roles.join(", "),
          action: "UPDATE_ROOM_STATUS",
          entity: "PhysicalRoom",
          entityId: roomId,
          detailsJson: JSON.stringify(dataToUpdate),
        },
      });

      return NextResponse.json({ success: true, room: updatedRoom });
    }

    return NextResponse.json({ error: "Unsupported room action" }, { status: 400 });
  } catch (error: any) {
    console.error("Room update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update room" }, { status: 500 });
  }
}
