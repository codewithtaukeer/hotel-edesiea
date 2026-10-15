import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      guestName,
      phone,
      reservationDate,
      timeSlot,
      partySize = 4,
      floorPreference = "ROOFTOP_4TH",
      dietaryRequirement = "Pure Veg",
      notes,
    } = body;

    if (!guestName?.trim() || !phone?.trim() || !reservationDate || !timeSlot) {
      return NextResponse.json(
        { error: "Guest name, phone, reservation date, and time slot are required" },
        { status: 400 }
      );
    }

    const party = Math.max(1, parseInt(partySize, 10) || 1);

    // Save TableReservation to database
    const reservation = await prisma.tableReservation.create({
      data: {
        guestName: guestName.trim(),
        phone: phone.trim(),
        reservationDate,
        timeSlot,
        partySize: party,
        floorPreference: floorPreference || "ROOFTOP_4TH",
        dietaryRequirement: dietaryRequirement || "Pure Veg",
        status: "CONFIRMED",
        notes: notes?.trim() || null,
      },
      include: { table: true },
    });

    return NextResponse.json({
      success: true,
      message: "Table reservation request confirmed at Hotel Edesiea restaurant.",
      reservation,
    });
  } catch (error: any) {
    console.error("Table reservation error:", error);
    return NextResponse.json(
      { error: "Failed to record table reservation. Please reach us on WhatsApp." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (
      !session ||
      (!hasPermission(session.roles, "restaurant:view") &&
        !hasPermission(session.roles, "restaurant:manage"))
    ) {
      return NextResponse.json(
        { error: "Forbidden: Restaurant staff access required" },
        { status: 403 }
      );
    }

    const reservations = await prisma.tableReservation.findMany({
      orderBy: { reservationDate: "desc" },
      include: { table: true },
      take: 50,
    });

    return NextResponse.json({ reservations });
  } catch (error: any) {
    console.error("Get reservations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
