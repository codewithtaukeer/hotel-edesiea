import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Staff token required" },
        { status: 401 }
      );
    }

    const bookingId = params.id;
    const body = await request.json();
    const { action, roomId, note, extraAmount, reason } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { bookingRooms: true, guest: true, payments: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 1. CHECK-IN ACTION
    if (action === "CHECK_IN") {
      if (!hasPermission(session.roles, "reception:checkin")) {
        return NextResponse.json({ error: "Forbidden: Check-in permission required" }, { status: 403 });
      }

      const assignedRoomId = roomId || booking.bookingRooms[0]?.roomId;
      if (!assignedRoomId) {
        return NextResponse.json({ error: "Please assign a physical room before check-in" }, { status: 400 });
      }

      await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: "CHECKED_IN" },
        }),
        prisma.bookingRoom.updateMany({
          where: { bookingId },
          data: { roomId: assignedRoomId },
        }),
        prisma.physicalRoom.update({
          where: { id: assignedRoomId },
          data: { housekeepingStatus: "CLEAN" },
        }),
        prisma.auditLog.create({
          data: {
            actorId: session.userId,
            actorRole: session.roles.join(", "),
            action: "GUEST_CHECK_IN",
            entity: "Booking",
            entityId: bookingId,
            detailsJson: JSON.stringify({ assignedRoomId, guest: booking.guest.fullName }),
          },
        }),
      ]);

      return NextResponse.json({ success: true, message: `Checked in to Room ${assignedRoomId}` });
    }

    // 2. CHECK-OUT ACTION
    if (action === "CHECK_OUT") {
      if (!hasPermission(session.roles, "reception:checkout")) {
        return NextResponse.json({ error: "Forbidden: Check-out permission required" }, { status: 403 });
      }

      const assignedRoomId = booking.bookingRooms[0]?.roomId;

      await prisma.$transaction(async (tx) => {
        // Mark booking checked out & settled
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "CHECKED_OUT",
            balanceDue: 0,
            paymentStatus: "PAID_IN_FULL",
          },
        });

        // Mark room as DIRTY for housekeeping
        if (assignedRoomId) {
          await tx.physicalRoom.update({
            where: { id: assignedRoomId },
            data: { housekeepingStatus: "DIRTY" },
          });

          // Create housekeeping turnaround task
          await tx.housekeepingTask.create({
            data: {
              roomId: assignedRoomId,
              status: "PENDING",
              taskType: "DEPARTURE_CLEAN",
              notes: `Departure clean after ${booking.guest.fullName} checkout`,
            },
          });
        }

        // Generate final invoice
        const invoiceNumber = "EAR-INV-" + Math.floor(1000 + Math.random() * 9000);
        await tx.invoice.create({
          data: {
            invoiceNumber,
            bookingId: booking.id,
            guestId: booking.guestId,
            subTotal: booking.baseRoomCharge,
            taxAmount: booking.taxAmount,
            grandTotal: booking.totalAmount,
            balancePaid: booking.totalAmount,
            status: "SETTLED",
          },
        });

        // Audit Log
        await tx.auditLog.create({
          data: {
            actorId: session.userId,
            actorRole: session.roles.join(", "),
            action: "GUEST_CHECK_OUT",
            entity: "Booking",
            entityId: bookingId,
            detailsJson: JSON.stringify({ invoiceNumber, settledAmount: booking.totalAmount }),
          },
        });
      });

      return NextResponse.json({ success: true, message: "Checked out successfully. Room marked dirty." });
    }

    // 3. CANCELLATION ACTION
    if (action === "CANCEL") {
      if (!hasPermission(session.roles, "bookings:manage")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Check 48-hour rule
      const checkInDateTime = new Date(`${booking.checkInDate}T12:00:00+05:30`);
      const now = new Date();
      const diffHours = (checkInDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const isEligibleForRefund = diffHours >= 48;

      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "CANCELLED",
            cancellationDate: now,
            cancellationNote: reason || "Guest requested cancellation via WhatsApp/Front desk",
            paymentStatus: isEligibleForRefund && booking.advancePaid > 0 ? "REFUNDED" : booking.paymentStatus,
          },
        });

        if (isEligibleForRefund && booking.advancePaid > 0) {
          await tx.refund.create({
            data: {
              bookingId: booking.id,
              amount: booking.advancePaid,
              status: "COMPLETED",
              reason: `48-hour advance cancellation refund. ${reason || ""}`,
              processedBy: session.name,
            },
          });
        }

        await tx.auditLog.create({
          data: {
            actorId: session.userId,
            actorRole: session.roles.join(", "),
            action: "BOOKING_CANCELLED",
            entity: "Booking",
            entityId: bookingId,
            detailsJson: JSON.stringify({ diffHours, isEligibleForRefund, advance: booking.advancePaid }),
          },
        });
      });

      return NextResponse.json({
        success: true,
        isEligibleForRefund,
        message: isEligibleForRefund
          ? "Booking cancelled with eligible ₹500 advance refund"
          : "Booking cancelled outside 48-hr window (Non-refundable as per policy)",
      });
    }

    return NextResponse.json({ error: "Unsupported booking action" }, { status: 400 });
  } catch (error: any) {
    console.error("Booking action error:", error);
    return NextResponse.json({ error: error.message || "Failed to process booking action" }, { status: 500 });
  }
}
