import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export async function GET() {
  try {
    let settings = await prisma.hotelSettings.findUnique({
      where: { id: "edesiea_settings" },
    });

    if (!settings) {
      settings = await prisma.hotelSettings.create({
        data: { id: "edesiea_settings" },
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session || !hasPermission(session.roles, "settings:edit")) {
      return NextResponse.json(
        { error: "Forbidden: Super Admin or Hotel Manager privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const updated = await prisma.hotelSettings.upsert({
      where: { id: "edesiea_settings" },
      update: {
        hotelName: body.hotelName,
        legalName: body.legalName,
        tagline: body.tagline,
        taglineMr: body.taglineMr,
        address: body.address,
        landmark: body.landmark,
        phone: body.phone,
        whatsapp: body.whatsapp,
        emailPrimary: body.emailPrimary,
        checkInTime: body.checkInTime,
        checkOutTime: body.checkOutTime,
        advanceDepositAmount: parseFloat(body.advanceDepositAmount || 500),
        cancellationHoursLimit: parseInt(body.cancellationHoursLimit || 48, 10),
        restaurantGstRate: parseFloat(body.restaurantGstRate || 5.0),
        roomGstRate: parseFloat(body.roomGstRate || 12.0),
        gstin: body.gstin || "",
        isBookingOpen: body.isBookingOpen ?? true,
      },
      create: {
        id: "edesiea_settings",
        hotelName: body.hotelName,
        phone: body.phone,
        whatsapp: body.whatsapp,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorRole: session.roles.join(", "),
        action: "UPDATE_HOTEL_SETTINGS",
        entity: "HotelSettings",
        entityId: "edesiea_settings",
        detailsJson: JSON.stringify(body),
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    console.error("Settings update error:", error);
    return NextResponse.json({ error: "Failed to update hotel settings" }, { status: 500 });
  }
}
