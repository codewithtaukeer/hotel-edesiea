import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";
import {
  verifyRazorpaySignature,
  verifyWebhookSignature,
  recordVerifiedPayment,
  processRefund,
} from "../src/lib/payments-core.mjs";

const prisma = new PrismaClient();

test("Phase 4: Cryptographic HMAC SHA-256 signature verification according to Razorpay spec", () => {
  const secret = "test_secret_key_12345";
  const orderId = "order_9A33XWu170gUtm";
  const paymentId = "pay_29Ae07uhdu9w50";

  // Compute valid signature
  const body = `${orderId}|${paymentId}`;
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  assert.equal(
    verifyRazorpaySignature(orderId, paymentId, validSignature, secret),
    true,
    "Valid HMAC signature must verify successfully"
  );

  // Altered signature must fail
  assert.equal(
    verifyRazorpaySignature(orderId, paymentId, "forged_signature_xyz", secret),
    false,
    "Forged signature must be rejected"
  );

  // Altered payment ID must fail
  assert.equal(
    verifyRazorpaySignature(orderId, "pay_TAMPERED", validSignature, secret),
    false,
    "Tampered payment ID must fail verification"
  );
});

test("Phase 4: Webhook signature verification protects against forged events", () => {
  const webhookSecret = "whsec_live_secret";
  const rawPayload = JSON.stringify({ event: "payment.captured", amount: 50000 });

  const validSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawPayload)
    .digest("hex");

  assert.equal(
    verifyWebhookSignature(rawPayload, validSig, webhookSecret),
    true,
    "Valid webhook signature must pass"
  );

  assert.equal(
    verifyWebhookSignature(rawPayload, "invalid_sig", webhookSecret),
    false,
    "Invalid webhook signature must be rejected"
  );
});

test("Phase 4: Idempotent payment recording prevents duplicate transactions and balances correctly", async () => {
  // Create a temporary guest & booking for testing
  const guest = await prisma.guest.create({
    data: {
      fullName: "Test Idempotent Guest",
      phone: "+91 99999 88888",
    },
  });

  const booking = await prisma.booking.create({
    data: {
      bookingRef: "EDE-TEST-999",
      guestId: guest.id,
      status: "CONFIRMED",
      checkInDate: "2026-11-20",
      checkOutDate: "2026-11-21",
      totalNights: 1,
      baseRoomCharge: 3000,
      taxAmount: 360,
      totalAmount: 3360,
      advancePaid: 0,
      balanceDue: 3360,
      paymentStatus: "PENDING",
      paymentMethod: "RAZORPAY",
    },
  });

  const gatewayPaymentId = "pay_test_idempotent_" + Date.now();

  // First payment delivery
  const res1 = await recordVerifiedPayment({
    bookingId: booking.id,
    amount: 500,
    method: "RAZORPAY",
    gatewayOrderId: "order_test_1",
    gatewayPaymentId,
  });

  assert.equal(res1.isDuplicate, false, "Initial payment recording must succeed");
  assert.equal(res1.payment.amount, 500);

  // Check booking state after first payment
  const bookingAfter1 = await prisma.booking.findUnique({ where: { id: booking.id } });
  assert.equal(bookingAfter1.advancePaid, 500, "Advance must be updated to 500");
  assert.equal(bookingAfter1.balanceDue, 2860, "Balance due must equal 3360 - 500 = 2860");
  assert.equal(bookingAfter1.paymentStatus, "PARTIAL_ADVANCE");

  // Duplicate webhook / callback delivery with SAME gatewayPaymentId
  const res2 = await recordVerifiedPayment({
    bookingId: booking.id,
    amount: 500,
    method: "RAZORPAY",
    gatewayOrderId: "order_test_1",
    gatewayPaymentId,
  });

  assert.equal(res2.isDuplicate, true, "Duplicate payment must be detected idempotently");

  // Booking state MUST NOT be credited twice!
  const bookingAfter2 = await prisma.booking.findUnique({ where: { id: booking.id } });
  assert.equal(bookingAfter2.advancePaid, 500, "Advance must remain 500 and NOT duplicate to 1000");
  assert.equal(bookingAfter2.balanceDue, 2860, "Balance due must remain 2860");

  // Clean up test records
  await prisma.payment.deleteMany({ where: { bookingId: booking.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.guest.delete({ where: { id: guest.id } });
});

test("Phase 4: Refund processing records independent audit record and updates payment status", async () => {
  const guest = await prisma.guest.create({
    data: {
      fullName: "Test Refund Guest",
      phone: "+91 99999 77777",
    },
  });

  const booking = await prisma.booking.create({
    data: {
      bookingRef: "EDE-REFUND-111",
      guestId: guest.id,
      status: "CANCELLED",
      checkInDate: "2026-12-10",
      checkOutDate: "2026-12-12",
      totalNights: 2,
      baseRoomCharge: 6000,
      taxAmount: 720,
      totalAmount: 6720,
      advancePaid: 500,
      balanceDue: 6220,
      paymentStatus: "PARTIAL_ADVANCE",
    },
  });

  const refund = await processRefund({
    bookingId: booking.id,
    amount: 500,
    reason: "Eligible 48-hr cancellation refund",
    processedBy: "Accounts Manager",
  });

  assert.equal(refund.amount, 500);
  assert.equal(refund.status, "COMPLETED");

  const updatedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
  assert.equal(updatedBooking.paymentStatus, "REFUNDED");

  // Clean up test records
  await prisma.refund.deleteMany({ where: { bookingId: booking.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  await prisma.guest.delete({ where: { id: guest.id } });
});
