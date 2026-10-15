import test from "node:test";
import assert from "node:assert/strict";

// Verified business numbers
const ROOM_CATEGORIES = [
  { id: "deluxe", name: "Deluxe Room", pricePerNight: 3000, totalRooms: 3, maxAdults: 3 },
  { id: "honeymoon", name: "Honeymoon Suite", pricePerNight: 3500, totalRooms: 3, maxAdults: 2 },
  { id: "super-deluxe", name: "Super Deluxe Room", pricePerNight: 4000, totalRooms: 3, maxAdults: 3 },
  { id: "suite", name: "Suite Room", pricePerNight: 6500, totalRooms: 3, maxAdults: 4 },
];

test("Phase 1: Room category counts and inventory structure", () => {
  assert.equal(ROOM_CATEGORIES.length, 4, "Must have exactly 4 room categories");
  const totalPhysicalRooms = ROOM_CATEGORIES.reduce((acc, c) => acc + c.totalRooms, 0);
  assert.equal(totalPhysicalRooms, 12, "Hotel Edesiea must have exactly 12 physical rooms");
});

test("Phase 1: Stay date interval and night calculation", () => {
  const calculateNights = (checkInStr, checkOutStr) => {
    const d1 = new Date(checkInStr);
    const d2 = new Date(checkOutStr);
    const diffTime = d2.getTime() - d1.getTime();
    return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
  };

  assert.equal(calculateNights("2026-10-18", "2026-10-19"), 1, "1 night for 18th to 19th");
  assert.equal(calculateNights("2026-10-18", "2026-10-21"), 3, "3 nights for 18th to 21st");
  assert.equal(calculateNights("2026-10-18", "2026-10-18"), 1, "Same-day edge case defaults safely to 1 night");
});

test("Phase 1: Pricing engine, GST calculation, advance rule & balance reconciliation", () => {
  const calculateBookingFinances = (roomPricePerNight, nights) => {
    const baseRoomCharge = roomPricePerNight * nights;
    const gstRate = 0.12; // 12% statutory room GST
    const gstAmount = Math.round(baseRoomCharge * gstRate);
    const totalPayable = baseRoomCharge + gstAmount;
    const advanceRequired = 500;
    const balanceDue = totalPayable - advanceRequired;

    return { baseRoomCharge, gstAmount, totalPayable, advanceRequired, balanceDue };
  };

  // Test 1: Deluxe Room for 2 nights
  const res1 = calculateBookingFinances(3000, 2);
  assert.equal(res1.baseRoomCharge, 6000);
  assert.equal(res1.gstAmount, 720);
  assert.equal(res1.totalPayable, 6720);
  assert.equal(res1.advanceRequired, 500);
  assert.equal(res1.balanceDue, 6220);
  assert.equal(res1.advanceRequired + res1.balanceDue, res1.totalPayable, "Advance + Balance must equal Total");

  // Test 2: Suite Room for 1 night
  const res2 = calculateBookingFinances(6500, 1);
  assert.equal(res2.baseRoomCharge, 6500);
  assert.equal(res2.gstAmount, 780);
  assert.equal(res2.totalPayable, 7280);
  assert.equal(res2.advanceRequired, 500);
  assert.equal(res2.balanceDue, 6780);
  assert.equal(res2.advanceRequired + res2.balanceDue, res2.totalPayable);
});

test("Phase 1: Restaurant Bill Receipt calculation matches real customer invoice EAR_649", () => {
  // Items from uploaded receipt EAR_649
  const billItems = [
    { name: "butter cheese naan", qty: 1, rate: 130 },
    { name: "paneer pahadi", qty: 1, rate: 279 },
    { name: "roti", qty: 3, rate: 30 },
    { name: "veg diwani handi", qty: 1, rate: 279 },
    { name: "veg fried rice", qty: 1, rate: 219 },
    { name: "gulab jamun", qty: 3, rate: 50 },
    { name: "water bottle", qty: 1, rate: 20 },
  ];

  const subTotal = billItems.reduce((acc, item) => acc + item.qty * item.rate, 0);
  assert.equal(subTotal, 1167.0, "Subtotal must equal exactly 1167.00 as on receipt EAR_649");

  const cgst = parseFloat((subTotal * 0.025).toFixed(2));
  const sgst = parseFloat((subTotal * 0.025).toFixed(2));
  assert.equal(cgst, 29.18, "CGST 2.5% must be 29.18");
  assert.equal(sgst, 29.18, "SGST 2.5% must be 29.18");

  const netAmount = parseFloat((subTotal + cgst + sgst).toFixed(2));
  assert.equal(netAmount, 1225.36, "Net amount before roundoff");

  const roundedPayable = Math.round(netAmount);
  assert.equal(roundedPayable, 1225.0, "Net payable rounded to nearest rupee matches receipt EAR_649");
});

test("Phase 1: 48-Hour cancellation window check", () => {
  const isCancellationFree = (checkInDateStr, requestDateStr) => {
    const checkIn = new Date(`${checkInDateStr}T12:00:00+05:30`);
    const request = new Date(`${requestDateStr}T12:00:00+05:30`);
    const diffHours = (checkIn.getTime() - request.getTime()) / (1000 * 60 * 60);
    return diffHours >= 48;
  };

  assert.equal(isCancellationFree("2026-10-25", "2026-10-22"), true, "3 days prior is eligible for free cancel");
  assert.equal(isCancellationFree("2026-10-25", "2026-10-23"), true, "Exactly 48 hours is eligible");
  assert.equal(isCancellationFree("2026-10-25", "2026-10-24"), false, "24 hours prior is non-refundable");
  assert.equal(isCancellationFree("2026-10-25", "2026-10-25"), false, "Same-day is non-refundable");
});
