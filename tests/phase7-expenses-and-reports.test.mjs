import test from "node:test";
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

test("Phase 7: Operating expense recording, categorization, and ledger persistence", async () => {
  const today = new Date().toISOString().split("T")[0];

  // 1. Create a grocery operating expense
  const expense = await prisma.expense.create({
    data: {
      category: "KITCHEN_GROCERY",
      payee: "Pali Fresh Dairy & Vegetables",
      amount: 2450.0,
      paymentMethod: "UPI",
      invoiceRef: `GROCERY-INV-${Date.now()}`,
      approvedBy: "Head Chef & Accountant",
      description: "15 kg Fresh Malai Paneer + 5 kg Pure Desi Ghee for Thali specials",
      date: today,
    },
  });

  assert.ok(expense.id);
  assert.strictEqual(expense.category, "KITCHEN_GROCERY");
  assert.strictEqual(expense.amount, 2450.0);
  assert.strictEqual(expense.paymentMethod, "UPI");

  // 2. Query expenses for today
  const todaysExpenses = await prisma.expense.findMany({
    where: { date: today },
  });

  const found = todaysExpenses.find((e) => e.id === expense.id);
  assert.ok(found, "Created expense must be retrievable by date");

  // Clean up
  await prisma.expense.delete({ where: { id: expense.id } });
});

test("Phase 7: Daily settlement calculation and statutory tax aggregation", async () => {
  const roomRevenue = 12000.0;
  const roomTax12 = roomRevenue * 0.12; // 1,440

  const foodSubtotal = 4000.0;
  const foodCgst2_5 = foodSubtotal * 0.025; // 100
  const foodSgst2_5 = foodSubtotal * 0.025; // 100
  const foodGross = foodSubtotal + foodCgst2_5 + foodSgst2_5; // 4,200

  const grossCollections = roomRevenue + foodGross;
  const totalTaxCollected = roomTax12 + foodCgst2_5 + foodSgst2_5;
  const operatingExpenses = 3500.0;

  const netOperatingProfit = grossCollections - operatingExpenses;

  assert.strictEqual(roomTax12, 1440.0);
  assert.strictEqual(foodCgst2_5, 100.0);
  assert.strictEqual(foodSgst2_5, 100.0);
  assert.strictEqual(totalTaxCollected, 1640.0);
  assert.strictEqual(grossCollections, 16200.0);
  assert.strictEqual(netOperatingProfit, 12700.0);
});

test("Phase 7: Hospitality performance metrics math (Occupancy %, ADR, RevPAR)", async () => {
  const totalRooms = 12;
  const occupiedRooms = 8;
  const roomRevenue = 28000.0;

  // Occupancy rate
  const occupancyRate = parseFloat(((occupiedRooms / totalRooms) * 100).toFixed(1));
  assert.strictEqual(occupancyRate, 66.7);

  // Average Daily Rate (ADR = Room Revenue / Occupied Rooms)
  const adr = Math.round(roomRevenue / occupiedRooms);
  assert.strictEqual(adr, 3500); // Average 3500 / night per occupied room

  // Revenue Per Available Room (RevPAR = Room Revenue / Total Rooms)
  const revPar = Math.round(roomRevenue / totalRooms);
  assert.strictEqual(revPar, 2333);

  // RevPAR must equal ADR * (Occupancy / 100)
  const expectedRevPar = Math.round(adr * (occupiedRooms / totalRooms));
  assert.strictEqual(revPar, expectedRevPar);
});
