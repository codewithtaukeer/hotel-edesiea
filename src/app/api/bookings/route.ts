import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      guestName,
      guestPhone,
      guestEmail,
      categoryId,
      checkInDate,
      checkOutDate,
      adults = 2,
      children = 0,
      paymentMethod = "ADVANCE_GATEWAY", // or PAY_AT_HOTEL, CASH, UPI
      roomId, // Optional physical room assignment
      specialRequests,
    } = body;

    if (!guestName || !guestPhone || !categoryId || !checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "Missing required booking fields" },
        { status: 400 }
      );
    }

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { error: "Check-out must be after check-in" },
        { status: 400 }
      );
    }

    // Atomic transaction for reservation creation
    const booking = await prisma.$transaction(async (tx) => {
      // 1. Fetch category and rate
      const category = await tx.roomCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new Error("Invalid room category");
      }

      // 2. Calculate nights and financials
      const d1 = new Date(checkInDate);
      const d2 = new Date(checkOutDate);
      const diffTime = d2.getTime() - d1.getTime();
      const totalNights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

      const baseRoomCharge = category.basePrice * totalNights;
      const taxAmount = Math.round(baseRoomCharge * 0.12); // 12% Hotel GST
      const totalAmount = baseRoomCharge + taxAmount;
      const advanceRequired = 500.0;
      const advancePaid = paymentMethod === "ADVANCE_GATEWAY" ? advanceRequired : 0.0;
      const balanceDue = totalAmount - advancePaid;

      // 3. Find or create Guest
      let guest = await tx.guest.findUnique({
        where: { phone: guestPhone.trim() },
      });

      if (!guest) {
        guest = await tx.guest.create({
          data: {
            fullName: guestName.trim(),
            phone: guestPhone.trim(),
            email: guestEmail?.trim() || null,
          },
        });
      }

      // 4. Generate unique, non-sequential reference code EDE-XXXXXX
      const bookingRef =
        "EDE-" + Math.floor(100000 + Math.random() * 900000).toString();

      // 5. Create Booking record
      const newBooking = await tx.booking.create({
        data: {
          bookingRef,
          guestId: guest.id,
          status: "CONFIRMED",
          checkInDate,
          checkOutDate,
          totalNights,
          adults: parseInt(adults, 10),
          children: parseInt(children, 10),
          baseRoomCharge,
          taxAmount,
          totalAmount,
          advancePaid,
          balanceDue,
          paymentStatus:
            advancePaid >= advanceRequired ? "PARTIAL_ADVANCE" : "PENDING",
          paymentMethod,
          specialRequests: specialRequests || null,
        },
      });

      // 6. Create BookingRoom relationship
      await tx.bookingRoom.create({
        data: {
          bookingId: newBooking.id,
          categoryId,
          roomId: roomId || null,
          agreedRate: category.basePrice,
          checkInDate,
          checkOutDate,
        },
      });

      // 7. If advance was marked paid, record initial Payment
      if (advancePaid > 0) {
        await tx.payment.create({
          data: {
            bookingId: newBooking.id,
            amount: advancePaid,
            currency: "INR",
            status: "SUCCESS",
            method: paymentMethod,
            notes: "Direct booking advance deposit",
          },
        });
      }

      return newBooking;
    });

    return NextResponse.json({
      success: true,
      bookingRef: booking.bookingRef,
      booking,
    });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create reservation" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    const where: any = {};

    if (status !== "ALL") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { bookingRef: { contains: search } },
        { guest: { fullName: { contains: search } } },
        { guest: { phone: { contains: search } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ bookings });
  } catch (error: any) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
