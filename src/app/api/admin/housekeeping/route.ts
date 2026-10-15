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
    const floor = searchParams.get("floor");
    const status = searchParams.get("status");

    const where: any = {};
    if (floor && floor !== "ALL") {
      where.floor = parseInt(floor, 10);
    }
    if (status && status !== "ALL") {
      where.housekeepingStatus = status;
    }

    const rooms = await prisma.physicalRoom.findMany({
      where,
      include: {
        category: true,
        housekeepingTasks: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        maintenanceTickets: {
          where: { status: { not: "RESOLVED" } },
        },
      },
      orderBy: { roomNumber: "asc" },
    });

    // Fetch housekeeping staff for assignment dropdown
    const staff = await prisma.user.findMany({
      where: {
        isActive: true,
        roles: {
          some: {
            role: { in: ["HOUSEKEEPING", "HOTEL_MANAGER", "SUPER_ADMIN"] },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const recentTasks = await prisma.housekeepingTask.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        room: {
          include: { category: true },
        },
      },
    });

    return NextResponse.json({
      rooms,
      staff,
      recentTasks,
    });
  } catch (error: any) {
    console.error("Get housekeeping error:", error);
    return NextResponse.json(
      { error: "Failed to fetch housekeeping data" },
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
      (!hasPermission(session.roles, "housekeeping:manage") &&
        !hasPermission(session.roles, "housekeeping:status_update"))
    ) {
      return NextResponse.json(
        { error: "Forbidden: Housekeeping management permission required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      roomId,
      assignedTo,
      taskType = "DEPARTURE_CLEAN", // DEPARTURE_CLEAN, DAILY_REFRESH, DEEP_CLEAN
      notes,
    } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.housekeepingTask.create({
        data: {
          roomId,
          assignedTo: assignedTo || null,
          status: "PENDING",
          taskType,
          notes: notes || null,
        },
      });

      // Set room status to DIRTY when a new cleaning task is assigned
      await tx.physicalRoom.update({
        where: { id: roomId },
        data: {
          housekeepingStatus: "DIRTY",
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: session.userId,
          actorRole: session.roles.join(", "),
          action: "CREATE_HOUSEKEEPING_TASK",
          entity: "HousekeepingTask",
          entityId: task.id,
          detailsJson: JSON.stringify({ roomId, taskType, assignedTo }),
        },
      });

      return task;
    });

    return NextResponse.json({ success: true, task: result });
  } catch (error: any) {
    console.error("Create housekeeping task error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create housekeeping task" },
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
      (!hasPermission(session.roles, "housekeeping:status_update") &&
        !hasPermission(session.roles, "housekeeping:manage"))
    ) {
      return NextResponse.json(
        { error: "Forbidden: Housekeeping update permission required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      taskId,
      roomId,
      status, // PENDING, IN_PROGRESS, COMPLETED, INSPECTED
      checklistPassed,
      notes,
      directRoomStatus, // CLEAN, DIRTY, INSPECTING
    } = body;

    // Handle direct room housekeeping status quick-toggle
    if (roomId && directRoomStatus) {
      const updatedRoom = await prisma.physicalRoom.update({
        where: { id: roomId },
        data: { housekeepingStatus: directRoomStatus },
      });

      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          actorRole: session.roles.join(", "),
          action: "UPDATE_ROOM_HOUSEKEEPING_STATUS",
          entity: "PhysicalRoom",
          entityId: roomId,
          detailsJson: JSON.stringify({ directRoomStatus }),
        },
      });

      return NextResponse.json({ success: true, room: updatedRoom });
    }

    // Handle updating an existing HousekeepingTask
    if (!taskId) {
      return NextResponse.json(
        { error: "TaskId or (RoomId + directRoomStatus) is required" },
        { status: 400 }
      );
    }

    const task = await prisma.housekeepingTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.$transaction(async (tx) => {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (checklistPassed !== undefined) updateData.checklistPassed = checklistPassed;
      if (notes !== undefined) updateData.notes = notes;

      if (status === "IN_PROGRESS" && !task.startedAt) {
        updateData.startedAt = new Date();
      }
      if ((status === "COMPLETED" || status === "INSPECTED") && !task.completedAt) {
        updateData.completedAt = new Date();
      }

      const resTask = await tx.housekeepingTask.update({
        where: { id: taskId },
        data: updateData,
      });

      // Update room housekeeping status according to task progress
      let newRoomStatus: string | null = null;
      if (status === "IN_PROGRESS") {
        newRoomStatus = "INSPECTING";
      } else if (status === "COMPLETED" || status === "INSPECTED") {
        newRoomStatus = "CLEAN";
      }

      if (newRoomStatus) {
        await tx.physicalRoom.update({
          where: { id: task.roomId },
          data: { housekeepingStatus: newRoomStatus },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: session.userId,
          actorRole: session.roles.join(", "),
          action: "UPDATE_HOUSEKEEPING_TASK",
          entity: "HousekeepingTask",
          entityId: taskId,
          detailsJson: JSON.stringify({ status, checklistPassed, newRoomStatus }),
        },
      });

      return resTask;
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    console.error("Update housekeeping task error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update housekeeping task" },
      { status: 500 }
    );
  }
}
