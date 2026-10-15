import { NextResponse } from "next/server";
import { verifyRazorpaySignature, recordVerifiedPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature, bookingId, amount = 500 } = body;

    if (!orderId || !paymentId || !signature || !bookingId) {
      return NextResponse.json(
        { error: "Missing required verification fields" },
        { status: 400 }
      );
    }

    // 1. Verify cryptographic HMAC signature
    const isValid = verifyRazorpaySignature(orderId, paymentId, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed: Invalid HMAC signature" },
        { status: 400 }
      );
    }

    // 2. Idempotently record verified payment
    const result = await recordVerifiedPayment({
      bookingId,
      amount: parseFloat(amount),
      method: "RAZORPAY",
      gatewayOrderId: orderId,
      gatewayPaymentId: paymentId,
      gatewaySignature: signature,
      notes: "Online advance payment verified by server signature",
    });

    return NextResponse.json({
      success: true,
      isDuplicate: result.isDuplicate,
      paymentId: result.payment.id,
      amount: result.payment.amount,
      message: result.isDuplicate
        ? "Payment already recorded (idempotent response)"
        : "Payment verified and recorded successfully",
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
