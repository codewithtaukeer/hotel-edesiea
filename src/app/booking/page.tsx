"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { HOTEL_INFO, ROOM_CATEGORIES, RoomCategory } from "@/lib/constants";
import { useLanguage } from "@/components/LanguageContext";
import {
  Calendar,
  Users,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  CreditCard,
  Building,
  AlertCircle,
  ArrowRight,
  Clock,
  Printer,
} from "lucide-react";

function BookingContent() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(
    searchParams.get("checkIn") || todayStr
  );
  const [checkOut, setCheckOut] = useState(
    searchParams.get("checkOut") || tomorrowStr
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    searchParams.get("category") || "deluxe"
  );
  const [adults, setAdults] = useState<number>(
    parseInt(searchParams.get("guests") || "2", 10)
  );

  // Guest details form state
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(true);
  const [paymentMode, setPaymentMode] = useState<"advance" | "pay_at_hotel">(
    "advance"
  );

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");

  const currentCategory: RoomCategory =
    ROOM_CATEGORIES.find((c) => c.id === selectedCategoryId) ||
    ROOM_CATEGORIES[0];

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.max(
    checkOutDate.getTime() - checkInDate.getTime(),
    86400000
  );
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  // Financial calculations
  const baseRate = currentCategory.pricePerNight * nights;
  const gstRate = 0.12; // 12% Hotel GST
  const gstAmount = Math.round(baseRate * gstRate);
  const totalPayable = baseRate + gstAmount;
  const advancePayable = HOTEL_INFO.advanceRequired;
  const remainingDue = totalPayable - advancePayable;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreePolicy) {
      alert("Please agree to the cancellation and check-in policies.");
      return;
    }

    setIsSubmitting(true);

    // Simulate atomic confirmation & reference generation
    setTimeout(() => {
      const generatedRef =
        "EDE-" +
        Math.floor(100000 + Math.random() * 900000).toString();
      setBookingRef(generatedRef);
      setBookingConfirmed(true);
      setIsSubmitting(false);
    }, 800);
  };

  const whatsappConfirmationText = encodeURIComponent(
    `Namaskar Hotel Edesiea! Booking Confirmation:\n` +
      `• Ref: ${bookingRef}\n` +
      `• Guest: ${guestName}\n` +
      `• Room: ${currentCategory.name}\n` +
      `• Dates: ${checkIn} to ${checkOut} (${nights} night/s)\n` +
      `• Guests: ${adults} Adults\n` +
      `• Total Amount: ₹${totalPayable}\n` +
      `• Advance: ₹${advancePayable} (${
        paymentMode === "advance" ? "Paid / Recorded" : "Pay at Hotel"
      })\n` +
      `• Balance Due: ₹${remainingDue}\n` +
      `Please verify and confirm availability.`
  );

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {bookingConfirmed ? (
          /* Confirmation Success Screen */
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border-2 border-[#C59B27] p-8 sm:p-10 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full">
                Reservation Created Successfully
              </span>
              <h2 className="font-serif text-3xl font-bold text-slate-900 mt-3">
                Booking Reference: {bookingRef}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Save this reference code to check your booking status anytime.
              </p>
            </div>

            {/* Itemized charges table */}
            <div className="bg-slate-50 rounded-xl p-5 text-left space-y-2.5 text-xs text-slate-700 border border-slate-200">
              <div className="flex justify-between font-bold text-slate-900 text-sm border-b pb-2">
                <span>{currentCategory.name}</span>
                <span>{nights} Night(s)</span>
              </div>
              <div className="flex justify-between">
                <span>Guest Name:</span>
                <span className="font-semibold text-slate-900">{guestName}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone / WhatsApp:</span>
                <span className="font-semibold text-slate-900">{guestPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>Stay Dates:</span>
                <span>
                  {checkIn} (12:00 PM) to {checkOut} (11:00 AM)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Room Charges:</span>
                <span>₹{baseRate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & GST (12%):</span>
                <span>₹{gstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t pt-2 text-sm">
                <span>Total Amount:</span>
                <span>₹{totalPayable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Advance Required:</span>
                <span>₹{advancePayable}</span>
              </div>
              <div className="flex justify-between text-[#0E1A2B] font-bold border-t pt-2">
                <span>Balance Payable at Check-in:</span>
                <span>₹{remainingDue.toLocaleString()}</span>
              </div>
            </div>

            {/* WhatsApp action */}
            <div className="space-y-3 pt-2">
              <a
                href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=${whatsappConfirmationText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-6 rounded-lg text-sm shadow-md transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white/20" />
                <span>Verify Reservation on WhatsApp (+91 8855887673)</span>
              </a>

              <div className="flex justify-center gap-4 text-xs text-slate-600">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 underline"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt Summary
                </button>
                <Link href="/" className="hover:text-slate-900 underline">
                  Return to Homepage
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Booking Form & Price Calculator */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form: Guest & Stay Details (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#997316] font-bold">
                  Direct Reservation Engine
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  Complete Your Reservation
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Confirm room availability and secure your booking with only ₹500 advance deposit.
                </p>
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                {/* Stay Configuration */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Stay & Room Selection
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Check-in Date (12:00 PM)
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27] bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Check-out Date (11:00 AM)
                      </label>
                      <input
                        type="date"
                        required
                        min={checkIn || todayStr}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27] bg-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Select Category
                      </label>
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27] bg-white font-medium"
                      >
                        {ROOM_CATEGORIES.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} — ₹{cat.pricePerNight}/night
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Number of Adults
                      </label>
                      <select
                        value={adults}
                        onChange={(e) => setAdults(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27] bg-white font-medium"
                      >
                        <option value="1">1 Adult (Solo)</option>
                        <option value="2">2 Adults (Couple)</option>
                        <option value="3">3 Adults (Triple)</option>
                        <option value="4">4 Adults (Suite only)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Guest Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Guest Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Full Name (Primary Guest) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kadam"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 88558 87673"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Email Address (Optional for e-bill)
                    </label>
                    <input
                      type="email"
                      placeholder="guest@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Special Requests / Approximate Arrival Time
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Arriving by ST bus around 1 PM, elderly parents require lower floor room, quiet room..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                    />
                  </div>
                </div>

                {/* Payment Selection */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Payment Option
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setPaymentMode("advance")}
                      className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                        paymentMode === "advance"
                          ? "border-[#C59B27] bg-[#FCF9EE]"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">
                          ₹500 Advance Deposit
                        </span>
                        <CreditCard className="w-4 h-4 text-[#C59B27]" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Instant confirmation guarantee with ₹500 token.
                      </p>
                    </label>

                    <label
                      onClick={() => setPaymentMode("pay_at_hotel")}
                      className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                        paymentMode === "pay_at_hotel"
                          ? "border-[#C59B27] bg-[#FCF9EE]"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">
                          Pay at Hotel
                        </span>
                        <Building className="w-4 h-4 text-[#C59B27]" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Book provisional hold & settle at reception upon arrival.
                      </p>
                    </label>
                  </div>
                </div>

                {/* Policy Checkbox */}
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreePolicy}
                      onChange={(e) => setAgreePolicy(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-[#C59B27] rounded border-slate-300"
                    />
                    <span>
                      I agree to the{" "}
                      <strong>Check-in (12:00 PM) & Check-out (11:00 AM)</strong>{" "}
                      policy, and understand that cancellations are permitted up to 2 days (48 hours) prior to check-in via WhatsApp; non-refundable thereafter.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-[#0E1A2B] to-[#1E2E44] text-[#E5C158] hover:text-white font-bold rounded-xl text-base shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Securing Room...</span>
                  ) : (
                    <>
                      <span>
                        Confirm Booking ({paymentMode === "advance" ? "Pay ₹500 Advance" : "Pay at Hotel"})
                      </span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Summary Card (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-28 space-y-6">
              <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100">
                <Image
                  src={currentCategory.image}
                  alt={currentCategory.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-[#0E1A2B]/85 text-[#E5C158] text-xs font-bold px-2.5 py-1 rounded backdrop-blur-sm">
                  {currentCategory.name}
                </div>
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900">
                  {currentCategory.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {currentCategory.tagline}
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span>Stay Duration:</span>
                  <span className="font-semibold text-slate-900">
                    {nights} Night{nights > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Room Rate per Night:</span>
                  <span className="font-semibold text-slate-900">
                    ₹{currentCategory.pricePerNight.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Base Room Charge:</span>
                  <span>₹{baseRate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hotel GST (12%):</span>
                  <span>₹{gstAmount.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-base font-serif font-bold text-slate-900 border-t border-slate-200 pt-3">
                  <span>Total Payable:</span>
                  <span>₹{totalPayable.toLocaleString()}</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span>Advance Payable Now:</span>
                    <span>₹{advancePayable}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-emerald-700">
                    <span>Remaining Balance at Check-in:</span>
                    <span>₹{remainingDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-slate-600 text-[11px] space-y-1">
                <p className="font-bold text-slate-900">Need Help Booking?</p>
                <p>Call reception at {HOTEL_INFO.phone} or chat on WhatsApp for group pilgrim bookings.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm">Loading booking engine...</div>}>
      <BookingContent />
    </Suspense>
  );
}
