import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref")?.trim().toUpperCase();
    const phone = searchParams.get("phone")?.trim();

    if (!ref || !phone) {
      return NextResponse.json(
        { error: "Both booking reference number and registered phone number are required" },
        { status: 400 }
      );
    }

    // Clean phone number (strip spaces, dashes, +91)
    const normalizedPhone = phone.replace(/\D/g, "").slice(-10);

    const booking = await prisma.booking.findUnique({
      where: { bookingRef: ref },
      include: {
        guest: true,
        bookingRooms: {
          include: {
            category: true,
            room: true,
          },
        },
        payments: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "No booking found with this reference number" },
        { status: 404 }
      );
    }

    // Strict security check: phone number must match registered guest phone
    const guestPhoneDigits = booking.guest.phone.replace(/\D/g, "").slice(-10);
    if (guestPhoneDigits !== normalizedPhone) {
      return NextResponse.json(
        { error: "Phone number does not match this booking record" },
        { status: 403 }
      );
    }

    // Calculate 48-hour cancellation deadline eligibility
    const checkInDateTime = new Date(`${booking.checkInDate}T12:00:00.000Z`).getTime();
    const hoursRemaining = (checkInDateTime - Date.now()) / (1000 * 60 * 60);
    const isEligibleForRefund = hoursRemaining >= 48 && booking.status !== "CANCELLED";

    const primaryRoom = booking.bookingRooms[0];

    return NextResponse.json({
      booking: {
        id: booking.id,
        reference: booking.bookingRef,
        guestName: booking.guest.fullName,
        phone: booking.guest.phone,
        email: booking.guest.email,
        roomCategory: primaryRoom?.category?.name || "Standard Room",
        roomAssigned: primaryRoom?.room?.roomNumber
          ? `Room ${primaryRoom.room.roomNumber}`
          : "Assigned at Check-in",
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalNights: booking.totalNights,
        adults: booking.adults,
        children: booking.children,
        bookingStatus: booking.status,
        paymentStatus: booking.paymentStatus,
        totalAmount: booking.totalAmount,
        advancePaid: booking.advancePaid,
        balanceDue: booking.balanceDue,
        isEligibleForRefund,
        hoursRemaining: Math.round(hoursRemaining),
        createdAt: booking.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Booking lookup error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve booking information" },
      { status: 500 }
    );
  }
}
