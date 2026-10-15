import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export function doIntervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

export async function cleanupExpiredHolds() {
  const now = new Date();
  const result = await prisma.inventoryHold.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });
  return result.count;
}

export async function checkRoomAvailability(checkInDate, checkOutDate, requestedAdults = 2) {
  await cleanupExpiredHolds();

  const categories = await prisma.roomCategory.findMany({
    where: { isActive: true },
    include: {
      physicalRooms: {
        where: {
          operationalStatus: "AVAILABLE",
        },
      },
    },
  });

  const activeBookings = await prisma.booking.findMany({
    where: {
      status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_HOLD"] },
      checkInDate: { lt: checkOutDate },
      checkOutDate: { gt: checkInDate },
    },
    include: {
      bookingRooms: true,
    },
  });

  const activeHolds = await prisma.inventoryHold.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
      checkInDate: { lt: checkOutDate },
      checkOutDate: { gt: checkInDate },
    },
  });

  const occupiedRoomIds = new Set();
  const categoryOccupiedCount = {};

  for (const b of activeBookings) {
    for (const br of b.bookingRooms) {
      if (br.roomId) {
        occupiedRoomIds.add(br.roomId);
      }
      categoryOccupiedCount[br.categoryId] =
        (categoryOccupiedCount[br.categoryId] || 0) + 1;
    }
  }

  for (const hold of activeHolds) {
    if (hold.roomId) {
      occupiedRoomIds.add(hold.roomId);
    }
    categoryOccupiedCount[hold.categoryId] =
      (categoryOccupiedCount[hold.categoryId] || 0) + 1;
  }

  return categories.map((cat) => {
    const operationalRooms = cat.physicalRooms;
    const freeRooms = operationalRooms.filter((r) => !occupiedRoomIds.has(r.id));
    const occupiedCount = categoryOccupiedCount[cat.id] || 0;
    const remainingSlots = Math.max(0, cat.totalRooms - occupiedCount);
    const availableCount = Math.min(freeRooms.length, remainingSlots);

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      basePrice: cat.basePrice,
      totalRooms: cat.totalRooms,
      availableRoomsCount: availableCount,
      availableRoomIds: freeRooms.map((r) => r.id),
      isAvailable: availableCount > 0 && cat.maxAdults >= requestedAdults,
      maxAdults: cat.maxAdults,
    };
  });
}

export async function createTemporaryHold(categoryId, checkInDate, checkOutDate, roomId) {
  return await prisma.$transaction(async (tx) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const activeBookingCount = await tx.bookingRoom.count({
      where: {
        categoryId,
        checkInDate: { lt: checkOutDate },
        checkOutDate: { gt: checkInDate },
        booking: {
          status: { in: ["CONFIRMED", "CHECKED_IN", "PENDING_HOLD"] },
        },
      },
    });

    const activeHoldCount = await tx.inventoryHold.count({
      where: {
        categoryId,
        status: "ACTIVE",
        expiresAt: { gt: now },
        checkInDate: { lt: checkOutDate },
        checkOutDate: { gt: checkInDate },
      },
    });

    const category = await tx.roomCategory.findUnique({
      where: { id: categoryId },
      include: {
        physicalRooms: {
          where: { operationalStatus: "AVAILABLE" },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Category not found" };
    }

    const totalAvailable = Math.min(
      category.totalRooms,
      category.physicalRooms.length
    );

    if (activeBookingCount + activeHoldCount >= totalAvailable) {
      return { success: false, error: "No available rooms left for selected dates" };
    }

    const holdToken =
      "HOLD_" + Date.now() + "_" + Math.random().toString(36).substring(2, 8);

    await tx.inventoryHold.create({
      data: {
        holdToken,
        categoryId,
        roomId: roomId || null,
        checkInDate,
        checkOutDate,
        expiresAt,
        status: "ACTIVE",
      },
    });

    return { success: true, holdToken };
  });
}
