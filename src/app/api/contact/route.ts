import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, category = "GENERAL", message } = body;

    if (!name?.trim() || !phone?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, phone number, and message are required" },
        { status: 400 }
      );
    }

    // Phone format basic sanitization
    const cleanPhone = phone.trim();
    if (cleanPhone.length < 8) {
      return NextResponse.json(
        { error: "Please provide a valid contact number" },
        { status: 400 }
      );
    }

    const enquiry = await prisma.contactEnquiry.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        email: email?.trim() || null,
        category: category || "GENERAL",
        message: message.trim(),
        status: "NEW",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Your enquiry has been received by Hotel Edesiea front desk.",
      enquiryId: enquiry.id,
    });
  } catch (error: any) {
    console.error("Contact submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit enquiry. Please reach us directly on WhatsApp." },
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
      (!hasPermission(session.roles, "reception:checkin") &&
        !hasPermission(session.roles, "bookings:view"))
    ) {
      return NextResponse.json(
        { error: "Forbidden: Front desk staff access required" },
        { status: 403 }
      );
    }

    const enquiries = await prisma.contactEnquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ enquiries });
  } catch (error: any) {
    console.error("Get enquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}
