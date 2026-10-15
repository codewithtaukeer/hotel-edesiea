import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, amount = 500 } = body;

    let booking = null;
    if (bookingId) {
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_edesiea_pali";
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Decimal-safe amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    let orderId = "";

    // If real Razorpay credentials provided, make standard HTTPS call
    if (keySecret && !keySecret.includes("placeholder")) {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: booking ? booking.bookingRef : `rcpt_${Date.now()}`,
          notes: {
            hotel: "Hotel Edesiea, Pali",
            bookingRef: booking ? booking.bookingRef : "Direct Advance",
          },
        }),
      });

      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) {
        throw new Error(rzpData.error?.description || "Razorpay API error");
      }
      orderId = rzpData.id;
    } else {
      // Sandbox fallback order
      orderId = "order_pali_" + Math.random().toString(36).substring(2, 10);
    }

    return NextResponse.json({
      success: true,
      orderId,
      amount: parseFloat(amount),
      amountInPaise,
      currency: "INR",
      keyId,
      bookingRef: booking ? booking.bookingRef : null,
    });
  } catch (error: any) {
    console.error("Razorpay order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}
