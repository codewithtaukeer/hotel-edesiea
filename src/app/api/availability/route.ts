import { NextResponse } from "next/server";
import { checkRoomAvailability } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

    const checkIn = searchParams.get("checkIn") || today;
    const checkOut = searchParams.get("checkOut") || tomorrow;
    const adults = parseInt(searchParams.get("adults") || "2", 10);

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: "Check-out date must be strictly after check-in date" },
        { status: 400 }
      );
    }

    const results = await checkRoomAvailability(checkIn, checkOut, adults);

    return NextResponse.json({
      checkIn,
      checkOut,
      adults,
      categories: results,
    });
  } catch (error: any) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: "Failed to calculate room availability" },
      { status: 500 }
    );
  }
}
