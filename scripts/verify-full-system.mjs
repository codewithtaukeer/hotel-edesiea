// Live System Verification Script for Hotel Edesiea
const BASE_URL = "http://localhost:3000";

async function runVerification() {
  console.log("=== HOTEL EDESIEA: COMPREHENSIVE LIVE SYSTEM VERIFICATION ===");
  const results = [];

  const check = async (name, fn) => {
    try {
      const res = await fn();
      results.push({ name, status: "PASS", details: res || "OK" });
      console.log(`[PASS] ${name}`);
    } catch (err) {
      results.push({ name, status: "FAIL", error: err.message });
      console.error(`[FAIL] ${name}: ${err.message}`);
    }
  };

  // 1. PUBLIC PAGES LOAD TEST
  const publicPages = [
    "/",
    "/about",
    "/rooms",
    "/restaurant",
    "/dining",
    "/booking",
    "/availability",
    "/lookup",
    "/contact",
    "/gallery",
    "/location",
    "/policies",
    "/faq",
    "/terms",
    "/admin/login",
  ];

  for (const page of publicPages) {
    await check(`Public Page Load: ${page}`, async () => {
      const res = await fetch(`${BASE_URL}${page}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.includes("Hotel Edesiea") && !text.includes("Edesiea")) {
        throw new Error("Page missing brand keywords");
      }
      return `Loaded ${text.length} bytes`;
    });
  }

  // 2. AVAILABILITY CHECK API
  let availableCategories = [];
  await check("API: GET /api/availability", async () => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const res = await fetch(`${BASE_URL}/api/availability?checkIn=${today}&checkOut=${tomorrow}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.categories || data.categories.length !== 4) {
      throw new Error(`Expected 4 categories, got ${data.categories?.length}`);
    }
    availableCategories = data.categories;
    return `4 categories returned, total available rooms: ${data.totalAvailableRooms}`;
  });

  // 3. CONTACT FORM SUBMISSION
  let contactEnquiryId = null;
  await check("API: POST /api/contact (Validation & Persistence)", async () => {
    // Test validation
    const badRes = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", phone: "", message: "" }),
    });
    if (badRes.status !== 400) throw new Error(`Expected 400 for empty body, got ${badRes.status}`);

    // Valid submission
    const res = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Verification Guest",
        phone: "+91 98888 77777",
        email: "test.guest@example.com",
        category: "ROOM_BOOKING",
        message: "Automated live verification inquiry regarding temple darshan stay.",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.enquiryId) throw new Error("Missing enquiryId");
    contactEnquiryId = data.enquiryId;
    return `Enquiry created with ID: ${contactEnquiryId}`;
  });

  // 4. TABLE RESERVATION SUBMISSION
  let reservationId = null;
  await check("API: POST /api/dining/reservations", async () => {
    const res = await fetch(`${BASE_URL}/api/dining/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: "Pooja Sharma",
        phone: "+91 97777 66666",
        reservationDate: "2026-10-28",
        timeSlot: "20:00",
        partySize: 4,
        floorPreference: "ROOFTOP_4TH",
        dietaryRequirement: "Pure Veg (Jain)",
        notes: "Anniversary rooftop table with Ganpati view",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.reservation?.id) throw new Error("Missing reservation");
    reservationId = data.reservation.id;
    return `Reservation confirmed: ${reservationId} for 4 guests`;
  });

  // 5. CUSTOMER FEEDBACK SUBMISSION
  await check("API: POST /api/feedback", async () => {
    const res = await fetch(`${BASE_URL}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: "Mahesh Joshi",
        rating: 5,
        serviceCategory: "RESTAURANT",
        comments: "Excellent food and great ambiance near the Ballaleshwar Ganpati Temple!",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.feedback?.isApprovedForPublic) {
      throw new Error("5-star feedback should be auto-approved for public");
    }
    return `Feedback submitted and approved: Rating ${data.feedback.rating}/5`;
  });

  // 6. ROOM BOOKING ENGINE LIVE CREATION
  let createdBookingRef = null;
  const testPhone = "9822998877";
  await check("API: POST /api/bookings (End-to-End Room Booking)", async () => {
    const futureCheckIn = new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0];
    const futureCheckOut = new Date(Date.now() + 6 * 86400000).toISOString().split("T")[0];

    const res = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: "Sunil Deshmukh",
        guestPhone: testPhone,
        guestEmail: "sunil.deshmukh@example.com",
        categoryId: "deluxe",
        checkInDate: futureCheckIn,
        checkOutDate: futureCheckOut,
        adults: 2,
        children: 0,
        paymentMethod: "ADVANCE_GATEWAY",
        specialRequests: "Quiet room on 1st floor",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    if (!data.bookingRef) throw new Error("Missing bookingRef");
    createdBookingRef = data.bookingRef;
    return `Booking created: Ref ${createdBookingRef}, Total: ₹${data.totalAmount}, Advance Due: ₹${data.advancePayable}`;
  });

  // 7. BOOKING LOOKUP & PRIVACY ENFORCEMENT
  await check("API: GET /api/bookings/lookup (Privacy & Data Retrieval)", async () => {
    if (!createdBookingRef) throw new Error("No booking to look up");

    // A. Unauthorized access attempt (wrong phone number)
    const unauthorizedRes = await fetch(
      `${BASE_URL}/api/bookings/lookup?ref=${createdBookingRef}&phone=9999999999`
    );
    if (unauthorizedRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for mismatched phone, got ${unauthorizedRes.status}`);
    }

    // B. Authorized access attempt (correct registered phone number)
    const authorizedRes = await fetch(
      `${BASE_URL}/api/bookings/lookup?ref=${createdBookingRef}&phone=${testPhone}`
    );
    if (!authorizedRes.ok) throw new Error(`HTTP ${authorizedRes.status}`);
    const data = await authorizedRes.json();
    if (data.booking.reference !== createdBookingRef) {
      throw new Error("Mismatched reference in returned data");
    }
    if (!data.booking.isEligibleForRefund) {
      throw new Error("5-day future booking must be eligible for refund under 48-hr policy");
    }
    return `Retrieved booking ${createdBookingRef}, eligible for refund: ${data.booking.isEligibleForRefund}`;
  });

  // 8. 48-HOUR SELF-SERVICE CANCELLATION
  await check("API: POST /api/bookings/cancel (Policy Compliance & Refund Queue)", async () => {
    if (!createdBookingRef) throw new Error("No booking to cancel");

    const res = await fetch(`${BASE_URL}/api/bookings/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingRef: createdBookingRef,
        phone: testPhone,
        reason: "Trip rescheduled due to office work",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    if (!data.success || data.booking.status !== "CANCELLED") {
      throw new Error("Booking status should be CANCELLED");
    }
    return `Booking cancelled cleanly. Policy message: "${data.message}"`;
  });

  // 9. STAFF AUTHENTICATION (RBAC LOGIN)
  let staffToken = null;
  await check("API: POST /api/auth/login (Staff Authentication)", async () => {
    // Bad credentials test
    const badRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@hoteledesiea.com", password: "wrongpassword" }),
    });
    if (badRes.status !== 401) throw new Error(`Expected 401 for wrong password, got ${badRes.status}`);

    // Valid login
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@hoteledesiea.com", password: "Edesiea@Pali2026" }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.token) throw new Error("Missing auth token");
    staffToken = data.token;
    return `Staff authenticated as: ${data.user.name} (${data.user.roles.join(", ")})`;
  });

  // 10. PROTECTED ADMIN ENDPOINTS
  const adminEndpoints = [
    { name: "Admin Rooms & Occupancy", url: "/api/admin/rooms" },
    { name: "Admin Restaurant Tables", url: "/api/admin/tables" },
    { name: "Admin Menu Catalog", url: "/api/admin/menu" },
    { name: "Admin Housekeeping Board", url: "/api/admin/housekeeping" },
    { name: "Admin Maintenance Tickets", url: "/api/admin/maintenance" },
    { name: "Admin Daily Settlement Report", url: "/api/admin/reports/daily" },
    { name: "Admin Finance Ledger", url: "/api/admin/finance" },
  ];

  for (const ep of adminEndpoints) {
    await check(`Protected Admin API: ${ep.name}`, async () => {
      // 1. Without token (should be 401 or 403)
      const noAuthRes = await fetch(`${BASE_URL}${ep.url}`);
      if (noAuthRes.status !== 401 && noAuthRes.status !== 403) {
        throw new Error(`Expected 401/403 without token, got ${noAuthRes.status}`);
      }

      // 2. With Super Admin token
      const authRes = await fetch(`${BASE_URL}${ep.url}`, {
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      if (!authRes.ok) throw new Error(`HTTP ${authRes.status}`);
      const data = await authRes.json();
      return `Authorized access verified: ${Object.keys(data).join(", ")}`;
    });
  }

  console.log("\n=======================================================");
  console.log("             VERIFICATION SUMMARY");
  console.log("=======================================================");
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log(`TOTAL CHECKS : ${results.length}`);
  console.log(`PASSED       : ${passed}`);
  console.log(`FAILED       : ${failed}`);
  console.log("=======================================================\n");

  return { passed, failed, results };
}

runVerification().catch(console.error);
