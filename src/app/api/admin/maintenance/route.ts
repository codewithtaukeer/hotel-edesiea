import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Staff login required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const roomId = searchParams.get("roomId");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (priority && priority !== "ALL") {
      where.priority = priority;
    }
    if (roomId && roomId !== "ALL") {
      where.roomId = roomId;
    }

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      include: {
        room: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const rooms = await prisma.physicalRoom.findMany({
      orderBy: { roomNumber: "asc" },
      select: {
        id: true,
        roomNumber: true,
        floor: true,
        operationalStatus: true,
        housekeepingStatus: true,
        categoryId: true,
      },
    });

    // Calculate real maintenance analytics
    const allTickets = await prisma.maintenanceTicket.findMany();
    const openTickets = allTickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
    const urgentTickets = allTickets.filter((t) => t.priority === "URGENT" && t.status !== "RESOLVED").length;
    const blockedRooms = rooms.filter((r) => r.operationalStatus === "MAINTENANCE_BLOCKED").length;
    const totalRepairCost = allTickets.reduce((sum, t) => sum + (t.cost || 0), 0);

    return NextResponse.json({
      tickets,
      rooms,
      stats: {
        openTickets,
        urgentTickets,
        blockedRooms,
        totalRepairCost,
      },
    });
  } catch (error: any) {
    console.error("Get maintenance tickets error:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance tickets" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (
      !session ||
      (!hasPermission(session.roles, "maintenance:manage") &&
        !hasPermission(session.roles, "rooms:block"))
    ) {
      return NextResponse.json(
        { error: "Forbidden: Maintenance creation permission required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      roomId,
      title,
      description,
      priority = "MEDIUM", // LOW, MEDIUM, HIGH, URGENT
      blocksRoom = false,
      assignedTo,
      cost,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    // Generate unique sequential ticket reference TKT-XXXX
    const count = await prisma.maintenanceTicket.count();
    const ticketNumber = `TKT-${1000 + count + 1}`;

    const createdTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.maintenanceTicket.create({
        data: {
          ticketNumber,
          roomId: roomId || null,
          title,
          description,
          priority,
          status: "OPEN",
          blocksRoom: Boolean(blocksRoom),
          assignedTo: assignedTo || session.name || "Technician",
          cost: cost ? parseFloat(cost) : null,
        },
      });

      // If issue blocks room from booking, update physical room operational status
      if (blocksRoom && roomId) {
        await tx.physicalRoom.update({
          where: { id: roomId },
          data: {
            operationalStatus: "MAINTENANCE_BLOCKED",
            housekeepingStatus: "MAINTENANCE",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: session.userId,
          actorRole: session.roles.join(", "),
          action: "CREATE_MAINTENANCE_TICKET",
          entity: "MaintenanceTicket",
          entityId: ticket.id,
          detailsJson: JSON.stringify({
            ticketNumber,
            roomId,
            priority,
            blocksRoom,
          }),
        },
      });

      return ticket;
    });

    return NextResponse.json({ success: true, ticket: createdTicket });
  } catch (error: any) {
    console.error("Create maintenance ticket error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create maintenance ticket" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (
      !session ||
      (!hasPermission(session.roles, "maintenance:manage") &&
        !hasPermission(session.roles, "rooms:block"))
    ) {
      return NextResponse.json(
        { error: "Forbidden: Maintenance update permission required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      ticketId,
      status, // OPEN, IN_PROGRESS, RESOLVED
      priority,
      cost,
      assignedTo,
      resolutionNotes,
    } = body;

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const existingTicket = await prisma.maintenanceTicket.findUnique({
      where: { id: ticketId },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: "Maintenance ticket not found" },
        { status: 404 }
      );
    }

    const updatedTicket = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      if (cost !== undefined) updateData.cost = parseFloat(cost) || 0;

      if (status === "RESOLVED") {
        updateData.resolvedAt = new Date();
      }

      const ticket = await tx.maintenanceTicket.update({
        where: { id: ticketId },
        data: updateData,
      });

      // If resolved, and ticket was blocking a physical room, unblock room if no other blocking tickets exist
      if (status === "RESOLVED" && existingTicket.blocksRoom && existingTicket.roomId) {
        const remainingBlocks = await tx.maintenanceTicket.count({
          where: {
            roomId: existingTicket.roomId,
            blocksRoom: true,
            status: { not: "RESOLVED" },
            id: { not: ticketId },
          },
        });

        if (remainingBlocks === 0) {
          await tx.physicalRoom.update({
            where: { id: existingTicket.roomId },
            data: {
              operationalStatus: "AVAILABLE",
              housekeepingStatus: "DIRTY", // Require housekeeping clean & inspect before guest arrives
            },
          });
        }
      }

      // If cost incurred upon resolution, record in operating expenses ledger
      if (status === "RESOLVED" && cost && parseFloat(cost) > 0) {
        await tx.expense.create({
          data: {
            category: "MAINTENANCE",
            payee: assignedTo || "Maintenance Contractor",
            amount: parseFloat(cost),
            paymentMethod: "CASH",
            invoiceRef: ticket.ticketNumber,
            approvedBy: session.name || "Manager",
            description: `Repairs for ${ticket.ticketNumber}: ${ticket.title} (${resolutionNotes || "Resolved"})`,
            date: new Date().toISOString().split("T")[0],
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: session.userId,
          actorRole: session.roles.join(", "),
          action: "UPDATE_MAINTENANCE_TICKET",
          entity: "MaintenanceTicket",
          entityId: ticketId,
          detailsJson: JSON.stringify({ status, cost, resolutionNotes }),
        },
      });

      return ticket;
    });

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error: any) {
    console.error("Update maintenance ticket error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update maintenance ticket" },
      { status: 500 }
    );
  }
}
