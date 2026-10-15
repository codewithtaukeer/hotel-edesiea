import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySessionToken, hasPermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Staff login required" },
        { status: 401 }
      );
    }
    const categories = await prisma.restaurantCategory.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        menuItems: {
          orderBy: { name: "asc" },
        },
      },
    });

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error("Get menu error:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant menu" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session || !hasPermission(session.roles, "menu:edit")) {
      return NextResponse.json(
        { error: "Forbidden: Restaurant Manager or Super Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      categoryId,
      price,
      isJainAvailable = false,
      isChefSpecial = false,
      description,
    } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Item name, category, and price are required" },
        { status: 400 }
      );
    }

    const id =
      "item_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);

    const item = await prisma.menuItem.create({
      data: {
        id,
        categoryId,
        name: name.trim(),
        price: parseFloat(price),
        isJainAvailable: Boolean(isJainAvailable),
        isChefSpecial: Boolean(isChefSpecial),
        description: description?.trim() || null,
        isAvailable: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorRole: session.roles.join(", "),
        action: "ADD_MENU_ITEM",
        entity: "MenuItem",
        entityId: item.id,
        detailsJson: JSON.stringify(item),
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error("Add menu item error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add menu item" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session || !hasPermission(session.roles, "menu:edit")) {
      return NextResponse.json(
        { error: "Forbidden: Restaurant Manager or Super Admin privileges required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, name, price, isAvailable, isJainAvailable, isChefSpecial, description } =
      body;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required for update" },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (price !== undefined) dataToUpdate.price = parseFloat(price);
    if (isAvailable !== undefined) dataToUpdate.isAvailable = Boolean(isAvailable);
    if (isJainAvailable !== undefined)
      dataToUpdate.isJainAvailable = Boolean(isJainAvailable);
    if (isChefSpecial !== undefined)
      dataToUpdate.isChefSpecial = Boolean(isChefSpecial);
    if (description !== undefined) dataToUpdate.description = description;

    const updated = await prisma.menuItem.update({
      where: { id },
      data: dataToUpdate,
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorRole: session.roles.join(", "),
        action: "UPDATE_MENU_ITEM",
        entity: "MenuItem",
        entityId: id,
        detailsJson: JSON.stringify(dataToUpdate),
      },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    console.error("Update menu item error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    const session = token ? verifySessionToken(token) : null;

    if (!session || !hasPermission(session.roles, "menu:edit")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    await prisma.menuItem.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        actorRole: session.roles.join(", "),
        action: "DELETE_MENU_ITEM",
        entity: "MenuItem",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete menu item error:", error);
    return NextResponse.json(
      { error: "Failed to delete item (may have associated orders)" },
      { status: 500 }
    );
  }
}
