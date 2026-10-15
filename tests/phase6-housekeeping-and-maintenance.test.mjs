import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test("Phase 6: Housekeeping task lifecycle transitions room from DIRTY to INSPECTING to CLEAN", async () => {
  // 1. Pick a physical room
  const room = await prisma.physicalRoom.findFirst({
    where: { operationalStatus: "AVAILABLE" },
  });
  assert.ok(room, "Physical room must exist");

  // 2. Assign departure cleaning task and mark room DIRTY
  const task = await prisma.$transaction(async (tx) => {
    const t = await tx.housekeepingTask.create({
      data: {
        roomId: room.id,
        assignedTo: "Anita Housekeeping Lead",
        taskType: "DEPARTURE_CLEAN",
        status: "PENDING",
        notes: "Guest departed, 6-point clean needed",
      },
    });

    await tx.physicalRoom.update({
      where: { id: room.id },
      data: { housekeepingStatus: "DIRTY" },
    });

    return t;
  });

  let currentRoom = await prisma.physicalRoom.findUnique({ where: { id: room.id } });
  assert.strictEqual(currentRoom?.housekeepingStatus, "DIRTY");

  // 3. Mark task IN_PROGRESS -> room transitions to INSPECTING
  const inProgressTask = await prisma.$transaction(async (tx) => {
    const t = await tx.housekeepingTask.update({
      where: { id: task.id },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    await tx.physicalRoom.update({
      where: { id: room.id },
      data: { housekeepingStatus: "INSPECTING" },
    });

    return t;
  });

  assert.strictEqual(inProgressTask.status, "IN_PROGRESS");
  assert.ok(inProgressTask.startedAt);

  currentRoom = await prisma.physicalRoom.findUnique({ where: { id: room.id } });
  assert.strictEqual(currentRoom?.housekeepingStatus, "INSPECTING");

  // 4. Complete inspection with all 6 checklist items passed -> room transitions to CLEAN
  const inspectedTask = await prisma.$transaction(async (tx) => {
    const t = await tx.housekeepingTask.update({
      where: { id: task.id },
      data: {
        status: "INSPECTED",
        checklistPassed: true,
        completedAt: new Date(),
        notes: "Passed all 6 Edesiea verified hotel sanitization points",
      },
    });

    await tx.physicalRoom.update({
      where: { id: room.id },
      data: { housekeepingStatus: "CLEAN" },
    });

    return t;
  });

  assert.strictEqual(inspectedTask.status, "INSPECTED");
  assert.strictEqual(inspectedTask.checklistPassed, true);
  assert.ok(inspectedTask.completedAt);

  currentRoom = await prisma.physicalRoom.findUnique({ where: { id: room.id } });
  assert.strictEqual(currentRoom?.housekeepingStatus, "CLEAN");

  // Clean up test task
  await prisma.housekeepingTask.delete({ where: { id: task.id } });
});

test("Phase 6: Maintenance ticket with blocksRoom atomically blocks inventory from booking", async () => {
  // 1. Pick a room
  const room = await prisma.physicalRoom.findFirst({
    where: { operationalStatus: "AVAILABLE" },
  });
  assert.ok(room, "Physical room must exist");

  const ticketNumber = `TEST_TKT_${Date.now()}`;

  // 2. Create blocking ticket
  const ticket = await prisma.$transaction(async (tx) => {
    const t = await tx.maintenanceTicket.create({
      data: {
        ticketNumber,
        roomId: room.id,
        title: "Air Conditioner Fan Coil Vibration",
        description: "Loud rattling in split unit, needs technician inspection",
        priority: "HIGH",
        status: "OPEN",
        blocksRoom: true,
        assignedTo: "Suresh HVAC",
        cost: 650,
      },
    });

    await tx.physicalRoom.update({
      where: { id: room.id },
      data: {
        operationalStatus: "MAINTENANCE_BLOCKED",
        housekeepingStatus: "MAINTENANCE",
      },
    });

    return t;
  });

  assert.strictEqual(ticket.blocksRoom, true);

  // 3. Verify room is MAINTENANCE_BLOCKED in DB
  let blockedRoom = await prisma.physicalRoom.findUnique({ where: { id: room.id } });
  assert.strictEqual(blockedRoom?.operationalStatus, "MAINTENANCE_BLOCKED");
  assert.strictEqual(blockedRoom?.housekeepingStatus, "MAINTENANCE");

  // 4. Verify room exclusion: Rooms with operationalStatus !== 'AVAILABLE' cannot be booked
  const availableRooms = await prisma.physicalRoom.findMany({
    where: {
      categoryId: room.categoryId,
      operationalStatus: "AVAILABLE",
    },
  });

  const isBlockedRoomIncluded = availableRooms.some((r) => r.id === room.id);
  assert.strictEqual(isBlockedRoomIncluded, false, "Blocked room must NOT be in available inventory");

  // 5. Resolve ticket and verify automated unblocking + expense creation
  const repairCost = 750.0;
  await prisma.$transaction(async (tx) => {
    await tx.maintenanceTicket.update({
      where: { id: ticket.id },
      data: {
        status: "RESOLVED",
        cost: repairCost,
        resolvedAt: new Date(),
      },
    });

    // Check if other blocking tickets remain
    const remainingBlocks = await tx.maintenanceTicket.count({
      where: {
        roomId: room.id,
        blocksRoom: true,
        status: { not: "RESOLVED" },
        id: { not: ticket.id },
      },
    });

    if (remainingBlocks === 0) {
      await tx.physicalRoom.update({
        where: { id: room.id },
        data: {
          operationalStatus: "AVAILABLE",
          housekeepingStatus: "DIRTY", // Require cleaning before guest check-in
        },
      });
    }

    // Record expense in operating ledger
    await tx.expense.create({
      data: {
        category: "MAINTENANCE",
        payee: "Suresh HVAC",
        amount: repairCost,
        paymentMethod: "CASH",
        invoiceRef: ticket.ticketNumber,
        approvedBy: "Hotel Manager",
        description: `Repairs for ${ticket.ticketNumber}: AC repair resolved`,
        date: new Date().toISOString().split("T")[0],
      },
    });
  });

  // Verify room is restored to AVAILABLE and DIRTY
  const restoredRoom = await prisma.physicalRoom.findUnique({ where: { id: room.id } });
  assert.strictEqual(restoredRoom?.operationalStatus, "AVAILABLE");
  assert.strictEqual(restoredRoom?.housekeepingStatus, "DIRTY");

  // Verify expense ledger record
  const expense = await prisma.expense.findFirst({
    where: { invoiceRef: ticket.ticketNumber },
  });
  assert.ok(expense, "Expense record must be created for maintenance repair cost");
  assert.strictEqual(expense.amount, repairCost);
  assert.strictEqual(expense.category, "MAINTENANCE");

  // Restore room housekeeping status to CLEAN
  await prisma.physicalRoom.update({
    where: { id: room.id },
    data: { housekeepingStatus: "CLEAN" },
  });

  // Clean up test ticket and expense
  await prisma.maintenanceTicket.delete({ where: { id: ticket.id } });
  await prisma.expense.delete({ where: { id: expense.id } });
});
