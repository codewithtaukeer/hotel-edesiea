import { NextResponse } from "next/server";
import { verifySessionToken, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { roles: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found or deactivated" }, { status: 401 });
    }

    const roles = user.roles.map((r) => r.role);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roles,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to verify session" }, { status: 500 });
  }
}
