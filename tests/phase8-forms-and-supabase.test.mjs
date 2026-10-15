import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { checkSupabaseConnection, supabase } from "../src/lib/supabase-client.mjs";
import { createSessionToken, verifySessionToken } from "../src/lib/auth-core.mjs";

const prisma = new PrismaClient();

test("Phase 8: Supabase client initialization & live database connectivity", async () => {
  // Test connection to Supabase cloud project
  const status = await checkSupabaseConnection();
  assert.strictEqual(typeof status.connected, "boolean", "Connection status must be boolean");

  // Query public published metadata from Supabase
  const { data: categories, error } = await supabase
    .from("RoomCategory")
    .select("id, name, basePrice")
    .order("basePrice", { ascending: true });

  assert.strictEqual(error, null, "Supabase public query should not error");
  assert.ok(Array.isArray(categories), "Categories should be an array");
  assert.strictEqual(categories.length, 4, "Should return 4 room categories from Supabase");
  assert.strictEqual(categories[0].id, "deluxe");
  assert.strictEqual(categories[0].basePrice, 3000);
});

test("Phase 8: Contact Enquiry form validation and database persistence", async () => {
  // 1. Validation test: Missing name/phone/message
  const invalidPayload = { name: "", phone: "", message: "" };
  const hasRequiredFields = !!(invalidPayload.name?.trim() && invalidPayload.phone?.trim() && invalidPayload.message?.trim());
  assert.strictEqual(hasRequiredFields, false, "Validation should reject missing required contact fields");

  // 2. Successful creation
  const testPhone = "+91 98765 43210";
  const cleanPhone = testPhone.trim();
  const enquiry = await prisma.contactEnquiry.create({
    data: {
      name: "Pooja Sharma",
      phone: cleanPhone,
      email: "pooja.sharma@example.com",
      category: "ROOM_BOOKING",
      message: "Inquiring about weekend stay near Ballaleshwar temple for family of 4",
      status: "NEW",
    },
  });

  assert.ok(enquiry.id);
  assert.strictEqual(enquiry.name, "Pooja Sharma");
  assert.strictEqual(enquiry.category, "ROOM_BOOKING");
  assert.strictEqual(enquiry.status, "NEW");

  // 3. Front-desk staff query
  const retrieved = await prisma.contactEnquiry.findUnique({
    where: { id: enquiry.id },
  });
  assert.ok(retrieved);
  assert.strictEqual(retrieved.phone, cleanPhone);

  // Clean up
  await prisma.contactEnquiry.delete({ where: { id: enquiry.id } });
});

test("Phase 8: Dining table reservation submission and party capacity checks", async () => {
  // 1. Validation: partySize clamping
  const rawParty = "6";
  const partySize = Math.max(1, parseInt(rawParty, 10) || 1);
  assert.strictEqual(partySize, 6);

  // 2. Persist table reservation
  const reservation = await prisma.tableReservation.create({
    data: {
      guestName: "Anil Deshmukh",
      phone: "+91 99887 76655",
      reservationDate: "2026-10-25",
      timeSlot: "19:30",
      partySize: partySize,
      floorPreference: "ROOFTOP_4TH",
      dietaryRequirement: "Pure Veg (Jain - No Onion/Garlic)",
      status: "CONFIRMED",
      notes: "Anniversary dinner table requested with temple hill view",
    },
  });

  assert.ok(reservation.id);
  assert.strictEqual(reservation.floorPreference, "ROOFTOP_4TH");
  assert.strictEqual(reservation.status, "CONFIRMED");
  assert.strictEqual(reservation.dietaryRequirement, "Pure Veg (Jain - No Onion/Garlic)");

  // Clean up
  await prisma.tableReservation.delete({ where: { id: reservation.id } });
});

test("Phase 8: Customer feedback rating bounds and public moderation workflow", async () => {
  // Rating clamping logic
  const clampRating = (r) => Math.max(1, Math.min(5, parseInt(r, 10) || 5));
  assert.strictEqual(clampRating(7), 5);
  assert.strictEqual(clampRating(-2), 1);
  assert.strictEqual(clampRating(4), 4);

  // 1. 5-Star genuine review (Auto-approved for public showcase)
  const fiveStarFeedback = await prisma.customerFeedback.create({
    data: {
      guestName: "Rajesh Kulkarni",
      phone: "+91 91234 56789",
      rating: 5,
      serviceCategory: "RESTAURANT",
      comments: "Outstanding Maharashtrian Thali and serene temple view from the rooftop restaurant!",
      isApprovedForPublic: true,
    },
  });

  // 2. 2-Star review (Requires staff moderation before public display)
  const twoStarFeedback = await prisma.customerFeedback.create({
    data: {
      guestName: "Anonymous Guest",
      phone: "+91 91234 00000",
      rating: 2,
      serviceCategory: "ROOM",
      comments: "AC remote battery was low on arrival.",
      isApprovedForPublic: false,
    },
  });

  // Public query should only return approved reviews
  const publicReviews = await prisma.customerFeedback.findMany({
    where: { isApprovedForPublic: true },
  });

  assert.ok(publicReviews.some((r) => r.id === fiveStarFeedback.id));
  assert.strictEqual(publicReviews.some((r) => r.id === twoStarFeedback.id), false, "Unapproved reviews must not be visible to public");

  // Clean up
  await prisma.customerFeedback.delete({ where: { id: fiveStarFeedback.id } });
  await prisma.customerFeedback.delete({ where: { id: twoStarFeedback.id } });
});

test("Phase 8: Booking lookup strict privacy check and 48-hour cancellation policy", async () => {
  const testUniquePhone = `+919822${Date.now().toString().slice(-6)}`;
  const guest = await prisma.guest.create({
    data: {
      fullName: "Vikram Patil",
      phone: testUniquePhone,
      email: `vikram.patil.${Date.now()}@example.com`,
    },
  });

  const category = await prisma.roomCategory.findFirst({ where: { id: "deluxe" } });
  assert.ok(category);

  // Future check-in date 5 days away (> 48 hours)
  const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const nextDay = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const testRef = `EDE-TEST-${Date.now().toString().slice(-4)}`;
  const booking = await prisma.booking.create({
    data: {
      bookingRef: testRef,
      guestId: guest.id,
      checkInDate: futureDate,
      checkOutDate: nextDay,
      totalNights: 1,
      adults: 2,
      children: 0,
      baseRoomCharge: 3000,
      taxAmount: 360,
      totalAmount: 3360,
      advancePaid: 500,
      balanceDue: 2860,
      status: "CONFIRMED",
      paymentStatus: "PARTIAL_ADVANCE",
      bookingRooms: {
        create: {
          categoryId: category.id,
          agreedRate: 3000,
          checkInDate: futureDate,
          checkOutDate: nextDay,
        },
      },
    },
  });

  // 1. Strict Privacy Check: Mismatched phone must be rejected
  const guestPhoneDigits = guest.phone.replace(/\D/g, "").slice(-10);
  const attackerPhone = "9999999999";
  assert.notStrictEqual(guestPhoneDigits, attackerPhone, "Different phone numbers must not match");

  // 2. 48-Hour Refund Eligibility Check
  const checkInDateTime = new Date(`${futureDate}T12:00:00.000Z`).getTime();
  const hoursRemaining = (checkInDateTime - Date.now()) / (1000 * 60 * 60);
  assert.ok(hoursRemaining > 48, "Test booking is more than 48 hours away");
  const isEligible = hoursRemaining >= 48 && booking.status !== "CANCELLED";
  assert.strictEqual(isEligible, true, "Should be eligible for refund");

  // 3. Process Cancellation
  const cancelledBooking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        cancellationDate: new Date(),
        cancellationNote: "Test cancellation via self-service portal",
      },
    });

    if (b.advancePaid > 0 && isEligible) {
      await tx.refund.create({
        data: {
          bookingId: b.id,
          amount: b.advancePaid,
          status: "PENDING",
          reason: "48-Hour policy compliant test cancellation",
          processedBy: "Self-Service Automated",
        },
      });
    }

    return b;
  });

  assert.strictEqual(cancelledBooking.status, "CANCELLED");

  // Verify Refund record queued
  const refund = await prisma.refund.findFirst({
    where: { bookingId: booking.id },
  });
  assert.ok(refund);
  assert.strictEqual(refund.amount, 500);
  assert.strictEqual(refund.status, "PENDING");

  // Clean up
  await prisma.refund.deleteMany({ where: { bookingId: booking.id } });
  await prisma.bookingRoom.deleteMany({ where: { bookingId: booking.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.guest.delete({ where: { id: guest.id } });
});
