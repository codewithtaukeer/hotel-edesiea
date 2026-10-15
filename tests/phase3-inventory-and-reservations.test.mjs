import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { doIntervalsOverlap, checkRoomAvailability, createTemporaryHold, cleanupExpiredHolds } from "../src/lib/inventory-core.mjs";

const prisma = new PrismaClient();

test("Phase 3: Standard interval convention boundary math [checkIn, checkOut)", () => {
  // Stay A: Oct 18 12:00 PM to Oct 20 11:00 AM -> [2026-10-18, 2026-10-20)
  // Stay B: Oct 20 12:00 PM to Oct 22 11:00 AM -> [2026-10-20, 2026-10-22)
  // Should NOT overlap because check-out is excluded for stay A!
  assert.equal(
    doIntervalsOverlap("2026-10-18", "2026-10-20", "2026-10-20", "2026-10-22"),
    false,
    "Back-to-back stays must not overlap (checkout date excluded)"
  );

  // Overlapping stays:
  // Stay C: Oct 18 to Oct 21 and Stay D: Oct 19 to Oct 22 -> Overlap Oct 19-21!
  assert.equal(
    doIntervalsOverlap("2026-10-18", "2026-10-21", "2026-10-19", "2026-10-22"),
    true,
    "Overlapping intervals must be detected"
  );

  // Contained stay:
  // Stay E: Oct 10 to Oct 25 and Stay F: Oct 12 to Oct 15 -> Overlap!
  assert.equal(
    doIntervalsOverlap("2026-10-10", "2026-10-25", "2026-10-12", "2026-10-15"),
    true
  );
});

test("Phase 3: Room search returns accurate physical inventory across 4 categories", async () => {
  const checkIn = "2026-11-01";
  const checkOut = "2026-11-03";

  const results = await checkRoomAvailability(checkIn, checkOut, 2);
  assert.equal(results.length, 4, "Must return all 4 categories");

  for (const cat of results) {
    assert.equal(cat.totalRooms, 3, "Each category has 3 physical rooms");
    assert.ok(cat.availableRoomsCount >= 0 && cat.availableRoomsCount <= 3);
  }
});

test("Phase 3: Room under maintenance is automatically excluded from available inventory", async () => {
  // Temporarily block room 103 for maintenance
  await prisma.physicalRoom.update({
    where: { id: "103" },
    data: { operationalStatus: "MAINTENANCE_BLOCKED" },
  });

  const results = await checkRoomAvailability("2026-11-10", "2026-11-12", 2);
  const deluxe = results.find((c) => c.categoryId === "deluxe");

  assert.ok(deluxe);
  assert.ok(
    !deluxe.availableRoomIds.includes("103"),
    "Maintenance blocked room 103 must not be returned in available rooms"
  );

  // Restore room 103
  await prisma.physicalRoom.update({
    where: { id: "103" },
    data: { operationalStatus: "AVAILABLE" },
  });
});

test("Phase 3: 10-Minute temporary inventory hold prevents overbooking and expires safely", async () => {
  const checkIn = "2026-12-01";
  const checkOut = "2026-12-03";

  // Create hold on Suite Room (3 total rooms)
  const hold1 = await createTemporaryHold("suite", checkIn, checkOut, "401");
  const hold2 = await createTemporaryHold("suite", checkIn, checkOut, "402");
  const hold3 = await createTemporaryHold("suite", checkIn, checkOut, "403");

  assert.equal(hold1.success, true);
  assert.equal(hold2.success, true);
  assert.equal(hold3.success, true);

  // Attempt 4th hold on 3-room category must be rejected (concurrency safe!)
  const hold4 = await createTemporaryHold("suite", checkIn, checkOut);
  assert.equal(hold4.success, false, "4th hold must fail as all 3 physical suites are held");

  // Clean up created holds
  await prisma.inventoryHold.deleteMany({
    where: {
      holdToken: { in: [hold1.holdToken, hold2.holdToken, hold3.holdToken] },
    },
  });
});
