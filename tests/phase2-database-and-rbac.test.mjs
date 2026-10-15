import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { hashPassword, createSessionToken, verifySessionToken, hasPermission, ROLE_PERMISSIONS } from "../src/lib/auth-core.mjs";

const prisma = new PrismaClient();

test("Phase 2: Database contains exactly 4 room categories and 12 physical rooms", async () => {
  const categories = await prisma.roomCategory.findMany({
    include: { physicalRooms: true },
  });

  assert.equal(categories.length, 4, "Must have exactly 4 room categories");

  const totalRooms = categories.reduce((sum, c) => sum + c.physicalRooms.length, 0);
  assert.equal(totalRooms, 12, "Must have exactly 12 physical rooms in database");

  for (const cat of categories) {
    assert.equal(cat.physicalRooms.length, 3, `Category ${cat.name} must have exactly 3 physical rooms`);
    assert.ok(cat.basePrice > 0, `Category ${cat.name} must have a valid rate`);
  }
});

test("Phase 2: Hotel Business Settings record verified details", async () => {
  const settings = await prisma.hotelSettings.findUnique({
    where: { id: "edesiea_settings" },
  });

  assert.ok(settings, "HotelSettings must exist");
  assert.equal(settings.hotelName, "Hotel Edesiea");
  assert.equal(settings.phone, "+91 8855887673");
  assert.equal(settings.advanceDepositAmount, 500.0, "Advance must be ₹500");
  assert.equal(settings.cancellationHoursLimit, 48, "Cancellation window must be 48 hours");
  assert.equal(settings.restaurantGstRate, 5.0, "Restaurant GST must be 5.0% as per bill EAR_649");
});

test("Phase 2: Authentication password hashing and token verification", () => {
  const password = "Edesiea@Pali2026";
  const hash = hashPassword(password);
  assert.ok(hash.length > 20, "Password hash must be generated");

  const wrongHash = hashPassword("WrongPassword123");
  assert.notEqual(hash, wrongHash, "Mismatched password must yield different hash");

  const token = createSessionToken({
    userId: "usr-123",
    email: "admin@hoteledesiea.com",
    name: "Owner",
    roles: ["SUPER_ADMIN"],
  });

  assert.ok(token.includes("."), "Session token must have signature format");

  const session = verifySessionToken(token);
  assert.ok(session, "Valid token must decode");
  assert.equal(session.userId, "usr-123");
  assert.equal(session.email, "admin@hoteledesiea.com");
  assert.deepEqual(session.roles, ["SUPER_ADMIN"]);

  const invalidSession = verifySessionToken("fake.invalid.token");
  assert.equal(invalidSession, null, "Tampered token must be rejected");
});

test("Phase 2: Role-Based Access Control (RBAC) permission enforcement across 8 staff roles", () => {
  // Super Admin: unrestricted
  assert.equal(hasPermission(["SUPER_ADMIN"], "settings:edit"), true);
  assert.equal(hasPermission(["SUPER_ADMIN"], "finance:view"), true);
  assert.equal(hasPermission(["SUPER_ADMIN"], "orders:status_update"), true);

  // Hotel Manager: can manage rooms and edit settings, but not arbitrary finance override
  assert.equal(hasPermission(["HOTEL_MANAGER"], "rooms:manage"), true);
  assert.equal(hasPermission(["HOTEL_MANAGER"], "settings:edit"), true);

  // Receptionist: can checkin and manage bookings, but CANNOT edit hotel settings
  assert.equal(hasPermission(["RECEPTIONIST"], "reception:checkin"), true);
  assert.equal(hasPermission(["RECEPTIONIST"], "bookings:manage"), true);
  assert.equal(hasPermission(["RECEPTIONIST"], "settings:edit"), false, "Receptionist cannot alter operational settings");
  assert.equal(hasPermission(["RECEPTIONIST"], "expenses:manage"), false, "Receptionist cannot manage expenses");

  // Housekeeping: can only update cleaning status
  assert.equal(hasPermission(["HOUSEKEEPING"], "housekeeping:status_update"), true);
  assert.equal(hasPermission(["HOUSEKEEPING"], "bookings:manage"), false);
  assert.equal(hasPermission(["HOUSEKEEPING"], "settings:edit"), false);

  // Kitchen: can update KOT orders
  assert.equal(hasPermission(["KITCHEN"], "orders:status_update"), true);
  assert.equal(hasPermission(["KITCHEN"], "rooms:view"), false);

  // Accountant: can view financial reports and invoices
  assert.equal(hasPermission(["ACCOUNTANT"], "finance:view"), true);
  assert.equal(hasPermission(["ACCOUNTANT"], "expenses:manage"), true);
  assert.equal(hasPermission(["ACCOUNTANT"], "rooms:block"), false);

  // Maintenance: can block rooms and manage tickets
  assert.equal(hasPermission(["MAINTENANCE"], "rooms:block"), true);
  assert.equal(hasPermission(["MAINTENANCE"], "maintenance:manage"), true);
  assert.equal(hasPermission(["MAINTENANCE"], "finance:view"), false);
});
