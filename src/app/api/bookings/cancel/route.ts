import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingRef, phone, reason } = body;

    if (!bookingRef || !phone) {
      return NextResponse.json(
        { error: "Booking reference and registered phone number are required" },
        { status: 400 }
      );
    }

    const ref = bookingRef.trim().toUpperCase();
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

    const booking = await prisma.booking.findUnique({
      where: { bookingRef: ref },
      include: {
        guest: true,
        payments: true,
        bookingRooms: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking reference not found" },
        { status: 404 }
      );
    }

    const guestPhoneDigits = booking.guest.phone.replace(/\D/g, "").slice(-10);
    if (guestPhoneDigits !== normalizedPhone) {
      return NextResponse.json(
        { error: "Phone number does not match this booking" },
        { status: 403 }
      );
    }

    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "This booking has already been cancelled" },
        { status: 400 }
      );
    }

    if (booking.status === "CHECKED_IN" || booking.status === "CHECKED_OUT") {
      return NextResponse.json(
        { error: `Cannot cancel a stay with status ${booking.status}` },
        { status: 400 }
      );
    }

    // Verify 48-hour cancellation policy
    const checkInDateTime = new Date(`${booking.checkInDate}T12:00:00.000Z`).getTime();
    const hoursRemaining = (checkInDateTime - Date.now()) / (1000 * 60 * 60);
    const isEligibleForRefund = hoursRemaining >= 48;

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: "CANCELLED",
          cancellationDate: new Date(),
          cancellationNote: reason || "Online guest cancellation request",
        },
      });

      // If advance was paid and eligible for refund, create Refund record
      if (booking.advancePaid > 0 && isEligibleForRefund) {
        await tx.refund.create({
          data: {
            bookingId: booking.id,
            amount: booking.advancePaid,
            status: "PENDING", // Queued for accountant disbursement
            reason: `48-Hour policy compliant cancellation: ${reason || "Guest requested"}`,
            processedBy: "Online Self-Service",
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorRole: "GUEST_SELF_SERVICE",
          action: "CANCEL_BOOKING",
          entity: "Booking",
          entityId: booking.id,
          detailsJson: JSON.stringify({
            bookingRef: ref,
            hoursRemaining,
            isEligibleForRefund,
            advancePaid: booking.advancePaid,
          }),
        },
      });

      return b;
    });

    return NextResponse.json({
      success: true,
      message: isEligibleForRefund
        ? `Booking ${ref} has been cancelled. Your refund of ₹${booking.advancePaid} is scheduled per the 48-hour cancellation policy.`
        : `Booking ${ref} has been cancelled. Note: Cancellation is within the 48-hour window before check-in. Please contact Pali front desk on WhatsApp for special assistance.`,
      isEligibleForRefund,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error("Booking cancellation error:", error);
    return NextResponse.json(
      { error: "Failed to process cancellation request" },
      { status: 500 }
    );
  }
}
