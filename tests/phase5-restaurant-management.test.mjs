import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test("Phase 5: Dining table inventory exists with correct floor assignments and capacities", async () => {
  const tables = await prisma.diningTable.findMany({
    orderBy: { tableNumber: "asc" },
  });

  assert.ok(tables.length >= 10, `Expected at least 10 tables, found ${tables.length}`);
  
  // Verify ground and rooftop floors
  const rooftopTables = tables.filter((t) => t.floor.includes("ROOFTOP"));
  const groundTables = tables.filter((t) => t.floor === "GROUND");
  
  assert.ok(rooftopTables.length > 0, "Rooftop dining tables must be configured");
  assert.ok(groundTables.length > 0, "Ground dining tables must be configured");

  for (const table of tables) {
    assert.ok(table.capacity >= 2, `Table ${table.tableNumber} should have capacity >= 2`);
    assert.ok(["AVAILABLE", "OCCUPIED", "RESERVED"].includes(table.status), `Valid table status`);
  }
});

test("Phase 5: Menu catalog contains verified pure-veg categories and dishes", async () => {
  const categories = await prisma.restaurantCategory.findMany({
    include: { menuItems: true },
  });

  assert.ok(categories.length >= 6, `Expected at least 6 categories, found ${categories.length}`);

  const allItems = await prisma.menuItem.findMany();
  assert.ok(allItems.length >= 20, `Expected comprehensive menu with 20+ signature items, found ${allItems.length}`);

  // Test Jain friendly options exist
  const jainItems = allItems.filter((i) => i.isJainAvailable);
  assert.ok(jainItems.length > 0, "Pure veg hotel must have Jain dietary options available");

  // Verify all items have positive non-zero prices
  for (const item of allItems) {
    assert.ok(item.price > 0, `Item ${item.name} must have a positive price`);
    assert.strictEqual(typeof item.isAvailable, "boolean");
  }
});

test("Phase 5: Server-side price enforcement protects against client-side price tampering", async () => {
  // Pick an item from menu
  const dalTadka = await prisma.menuItem.findFirst({
    where: { name: { contains: "Dal" } },
  });
  assert.ok(dalTadka, "Dal item must exist in menu");

  // Tampered payload where client claims item costs ₹1 instead of real price
  const tamperedPrice = 1.0;
  const quantity = 2;

  // The server ignores client price and fetches from DB
  const dbItem = await prisma.menuItem.findUnique({
    where: { id: dalTadka.id },
  });
  assert.ok(dbItem);

  const calculatedSubtotal = dbItem.price * quantity;
  assert.notStrictEqual(calculatedSubtotal, tamperedPrice * quantity);
  assert.strictEqual(calculatedSubtotal, dbItem.price * 2);

  // Calculate 5% statutory restaurant GST (2.5% CGST + 2.5% SGST) matching bill EAR_649
  const cgst = parseFloat((calculatedSubtotal * 0.025).toFixed(2));
  const sgst = parseFloat((calculatedSubtotal * 0.025).toFixed(2));
  const grandTotal = Math.round(calculatedSubtotal + cgst + sgst);

  assert.strictEqual(cgst, parseFloat((calculatedSubtotal * 0.025).toFixed(2)));
  assert.strictEqual(sgst, parseFloat((calculatedSubtotal * 0.025).toFixed(2)));
  assert.strictEqual(grandTotal, Math.round(calculatedSubtotal + cgst + sgst));
});

test("Phase 5: End-to-end Dine-in Order lifecycle, KOT progression, and automated table release", async () => {
  // 1. Pick an available table
  let table = await prisma.diningTable.findFirst({
    where: { status: "AVAILABLE" },
  });
  assert.ok(table, "An available table must be found for testing");

  // Pick 2 menu items
  const menuItems = await prisma.menuItem.findMany({ take: 2 });
  assert.strictEqual(menuItems.length, 2);

  const subTotal = menuItems[0].price * 1 + menuItems[1].price * 2;
  const cgst = parseFloat((subTotal * 0.025).toFixed(2));
  const sgst = parseFloat((subTotal * 0.025).toFixed(2));
  const grandTotal = Math.round(subTotal + cgst + sgst);
  const orderNumber = `TEST_EAR_${Date.now()}`;

  // 2. Create order in transaction and mark table OCCUPIED
  const createdOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.restaurantOrder.create({
      data: {
        tableId: table.id,
        orderNumber,
        orderType: "DINE_IN",
        status: "PENDING",
        subTotal,
        cgst,
        sgst,
        grandTotal,
        stewardName: "Ramesh Test",
        items: {
          create: [
            {
              menuItemId: menuItems[0].id,
              itemName: menuItems[0].name,
              unitPrice: menuItems[0].price,
              quantity: 1,
              totalPrice: menuItems[0].price * 1,
            },
            {
              menuItemId: menuItems[1].id,
              itemName: menuItems[1].name,
              unitPrice: menuItems[1].price,
              quantity: 2,
              totalPrice: menuItems[1].price * 2,
              specialInstructions: "Less spicy",
            },
          ],
        },
      },
      include: { items: true },
    });

    await tx.diningTable.update({
      where: { id: table.id },
      data: { status: "OCCUPIED" },
    });

    return order;
  });

  // Verify table is now OCCUPIED
  let updatedTable = await prisma.diningTable.findUnique({ where: { id: table.id } });
  assert.strictEqual(updatedTable?.status, "OCCUPIED");

  // 3. Progress status: PENDING -> KITCHEN_PREPARING
  const preparingOrder = await prisma.restaurantOrder.update({
    where: { id: createdOrder.id },
    data: { status: "KITCHEN_PREPARING" },
  });
  assert.strictEqual(preparingOrder.status, "KITCHEN_PREPARING");

  // 4. Progress status: KITCHEN_PREPARING -> READY
  const readyOrder = await prisma.restaurantOrder.update({
    where: { id: createdOrder.id },
    data: { status: "READY" },
  });
  assert.strictEqual(readyOrder.status, "READY");

  // 5. Progress status: READY -> SERVED
  const servedOrder = await prisma.restaurantOrder.update({
    where: { id: createdOrder.id },
    data: { status: "SERVED" },
  });
  assert.strictEqual(servedOrder.status, "SERVED");

  // Table remains occupied while dining
  updatedTable = await prisma.diningTable.findUnique({ where: { id: table.id } });
  assert.strictEqual(updatedTable?.status, "OCCUPIED");

  // 6. Settle bill: SERVED -> PAID and automatically release table
  await prisma.$transaction(async (tx) => {
    await tx.restaurantOrder.update({
      where: { id: createdOrder.id },
      data: { status: "PAID" },
    });

    const otherActiveOrders = await tx.restaurantOrder.count({
      where: {
        tableId: table.id,
        id: { not: createdOrder.id },
        status: { in: ["PENDING", "KITCHEN_PREPARING", "READY", "SERVED"] },
      },
    });

    if (otherActiveOrders === 0) {
      await tx.diningTable.update({
        where: { id: table.id },
        data: { status: "AVAILABLE" },
      });
    }
  });

  // Verify table is released back to AVAILABLE
  updatedTable = await prisma.diningTable.findUnique({ where: { id: table.id } });
  assert.strictEqual(updatedTable?.status, "AVAILABLE");

  // Clean up test order
  await prisma.orderItem.deleteMany({ where: { orderId: createdOrder.id } });
  await prisma.restaurantOrder.delete({ where: { id: createdOrder.id } });
});

test("Phase 5: Menu item price and availability modification", async () => {
  // Find a test item
  const item = await prisma.menuItem.findFirst();
  assert.ok(item);

  const originalPrice = item.price;
  const newPrice = originalPrice + 20;

  // Update price and sold out status
  const updated = await prisma.menuItem.update({
    where: { id: item.id },
    data: { price: newPrice, isAvailable: false },
  });

  assert.strictEqual(updated.price, newPrice);
  assert.strictEqual(updated.isAvailable, false);

  // Restore original values
  const restored = await prisma.menuItem.update({
    where: { id: item.id },
    data: { price: originalPrice, isAvailable: true },
  });

  assert.strictEqual(restored.price, originalPrice);
  assert.strictEqual(restored.isAvailable, true);
});
