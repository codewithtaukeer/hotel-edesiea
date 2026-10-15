import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "edesiea_razorpay_secret_pali_2026";
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "edesiea_webhook_secret_2026";

/**
 * Verify Razorpay payment signature according to official specification:
 * HMAC_SHA256(order_id + "|" + payment_id, secret) === signature
 */
export function verifyRazorpaySignature(orderId, paymentId, signature, secret = RAZORPAY_KEY_SECRET) {
  if (!orderId || !paymentId || !signature) return false;
  const body = `${orderId}|${paymentId}`;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  const expectedBuf = Buffer.from(expectedSig);
  const sigBuf = Buffer.from(signature);
  if (expectedBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, sigBuf);
}

/**
 * Verify Razorpay Webhook signature:
 * HMAC_SHA256(rawBody, webhookSecret) === signature
 */
export function verifyWebhookSignature(rawBody, signature, secret = RAZORPAY_WEBHOOK_SECRET) {
  if (!rawBody || !signature) return false;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const expectedBuf = Buffer.from(expectedSig);
  const sigBuf = Buffer.from(signature);
  if (expectedBuf.length !== sigBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, sigBuf);
}

/**
 * Idempotently record a verified payment.
 * If gatewayPaymentId already exists, returns existing record to prevent duplicate billing.
 */
export async function recordVerifiedPayment({
  bookingId,
  amount,
  method = "RAZORPAY",
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature,
  notes,
}) {
  return await prisma.$transaction(async (tx) => {
    // 1. Check idempotency: does this gatewayPaymentId already exist?
    if (gatewayPaymentId) {
      const existing = await tx.payment.findUnique({
        where: { gatewayPaymentId },
      });
      if (existing) {
        return { isDuplicate: true, payment: existing };
      }
    }

    // 2. Fetch booking
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // 3. Create immutable payment record
    const payment = await tx.payment.create({
      data: {
        bookingId,
        amount: parseFloat(amount),
        currency: "INR",
        status: "SUCCESS",
        method,
        gatewayOrderId,
        gatewayPaymentId,
        gatewaySignature,
        isReconciled: true,
        notes,
      },
    });

    // 4. Update booking balance due and status
    const newAdvancePaid = booking.advancePaid + amount;
    const newBalanceDue = Math.max(0, booking.totalAmount - newAdvancePaid);
    const newPaymentStatus =
      newBalanceDue <= 0
        ? "PAID_IN_FULL"
        : newAdvancePaid > 0
        ? "PARTIAL_ADVANCE"
        : "PENDING";

    await tx.booking.update({
      where: { id: bookingId },
      data: {
        advancePaid: newAdvancePaid,
        balanceDue: newBalanceDue,
        paymentStatus: newPaymentStatus,
      },
    });

    return { isDuplicate: false, payment };
  });
}

/**
 * Record an independent refund without mutating previous payments.
 */
export async function processRefund({
  bookingId,
  paymentId,
  amount,
  reason,
  processedBy,
}) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    const refund = await tx.refund.create({
      data: {
        bookingId,
        paymentId: paymentId || null,
        amount: parseFloat(amount),
        status: "COMPLETED",
        reason,
        processedBy,
      },
    });

    await tx.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: "REFUNDED",
      },
    });

    return refund;
  });
}
