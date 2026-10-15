import { NextResponse } from "next/server";
import { verifyWebhookSignature, recordVerifiedPayment } from "@/lib/payments";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const payload = event.payload.payment.entity;
      const orderId = payload.order_id;
      const paymentId = payload.id;
      const amount = payload.amount / 100; // convert paise to INR
      const bookingRef = payload.notes?.bookingRef;

      if (bookingRef) {
        const booking = await prisma.booking.findUnique({
          where: { bookingRef },
        });

        if (booking) {
          await recordVerifiedPayment({
            bookingId: booking.id,
            amount,
            method: "RAZORPAY",
            gatewayOrderId: orderId,
            gatewayPaymentId: paymentId,
            notes: "Webhook payment.captured event",
          });
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
