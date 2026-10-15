import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      guestName,
      phone,
      bookingRef,
      rating = 5,
      serviceCategory = "OVERALL",
      comments,
    } = body;

    if (!guestName?.trim() || !comments?.trim()) {
      return NextResponse.json(
        { error: "Guest name and review comments are required" },
        { status: 400 }
      );
    }

    const cleanRating = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));

    const feedback = await prisma.customerFeedback.create({
      data: {
        guestName: guestName.trim(),
        phone: phone?.trim() || null,
        bookingRef: bookingRef?.trim().toUpperCase() || null,
        rating: cleanRating,
        serviceCategory: serviceCategory || "OVERALL",
        comments: comments.trim(),
        // Auto-approve 5-star genuine reviews or wait for moderation
        isApprovedForPublic: cleanRating >= 4,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Thank you for sharing your experience at Hotel Edesiea!",
      feedback,
    });
  } catch (error: any) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    // If staff, return all feedback for management review
    if (session) {
      const allFeedback = await prisma.customerFeedback.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
      });
      return NextResponse.json({ feedback: allFeedback });
    }

    // Otherwise return only approved public reviews
    const publicReviews = await prisma.customerFeedback.findMany({
      where: { isApprovedForPublic: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ feedback: publicReviews });
  } catch (error: any) {
    console.error("Get feedback error:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 }
    );
  }
}
