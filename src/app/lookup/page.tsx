"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HOTEL_INFO } from "@/lib/constants";
import {
  Search,
  CheckCircle2,
  Calendar,
  Phone,
  MessageCircle,
  Clock,
  ShieldAlert,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";

export default function BookingLookupPage() {
  const [bookingRef, setBookingRef] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState<any>(null);

  // Cancellation state
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setCancelSuccessMsg("");
    setLoading(true);

    try {
      const cleanRef = bookingRef.trim().toUpperCase();
      const res = await fetch(
        `/api/bookings/lookup?ref=${encodeURIComponent(cleanRef)}&phone=${encodeURIComponent(phone.trim())}`
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "No matching reservation found.");
        setResult(null);
        setLoading(false);
        return;
      }

      setResult(data.booking);
    } catch (err: any) {
      setErrorMsg("Network error connecting to booking lookup system.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!result) return;
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel booking ${result.reference}?`
    );
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingRef: result.reference,
          phone: result.phone,
          reason: "Online guest cancellation request",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to cancel booking");
        setCancelling(false);
        return;
      }

      setCancelSuccessMsg(data.message);
      // Update local state
      setResult((prev: any) => ({
        ...prev,
        bookingStatus: "CANCELLED",
      }));
    } catch (err) {
      alert("Error processing cancellation request. Please contact reception.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-14">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Check Your Booking Status
          </h1>
          <p className="mt-2 text-slate-600 text-sm">
            Enter your Booking Reference (e.g. EDE-123456) and your registered phone number.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Booking Reference Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EDE-458921"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold uppercase focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Registered Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 88558 87673"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27] focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0E1A2B] hover:bg-[#1E2E44] text-[#E5C158] hover:text-white font-bold rounded-lg text-sm shadow transition-all active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#E5C158]" />
                  <span>Searching Reservation...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-[#C59B27]" />
                  <span>Search Reservation</span>
                </>
              )}
            </button>
          </form>

          {cancelSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 space-y-1">
              <p className="font-bold">Cancellation Confirmed:</p>
              <p>{cancelSuccessMsg}</p>
            </div>
          )}

          {result && (
            <div className="pt-6 border-t border-slate-200 space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Booking Reference
                  </span>
                  <p className="font-serif text-xl font-bold text-slate-900">
                    {result.reference}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      result.bookingStatus === "CANCELLED"
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}
                  >
                    ✓ {result.bookingStatus}
                  </span>
                  <span className="px-3 py-1 bg-[#0E1A2B] text-[#E5C158] text-xs font-bold rounded-full">
                    {result.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Room & Assigned Unit</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {result.roomCategory} ({result.roomAssigned})
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Primary Guest</span>
                  <p className="font-bold text-slate-900 text-sm">{result.guestName}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Check-in</span>
                  <p className="font-bold text-slate-900 text-sm">{result.checkInDate} (12:00 PM)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block mb-0.5">Check-out</span>
                  <p className="font-bold text-slate-900 text-sm">{result.checkOutDate} (11:00 AM)</p>
                </div>
              </div>

              {/* Financial Balance */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Total Amount (with GST):</span>
                  <span className="font-bold text-slate-900">₹{result.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Advance Deposited:</span>
                  <span>- ₹{result.advancePaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#0E1A2B] border-t pt-2">
                  <span>Remaining Balance Due at Front Desk:</span>
                  <span>₹{result.balanceDue.toLocaleString()}</span>
                </div>
              </div>

              {/* 48-Hour Cancellation Action Bar */}
              {result.bookingStatus !== "CANCELLED" && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900">Cancellation & Policy Window</h4>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {result.isEligibleForRefund
                          ? `Eligible for full ₹${result.advancePaid} refund (${result.hoursRemaining} hours until check-in).`
                          : `Less than 48 hours to check-in. Per hotel terms, online refund is not automated.`}
                      </p>
                    </div>

                    {result.isEligibleForRefund ? (
                      <button
                        onClick={handleCancelBooking}
                        disabled={cancelling}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{cancelling ? "Cancelling..." : "Cancel Reservation"}</span>
                      </button>
                    ) : (
                      <a
                        href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Namaskar%20Hotel%20Edesiea%2C%20inquiring%20about%20cancellation%20for%20Booking%20Ref%3A%20${result.reference}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions & WhatsApp Support */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <a
                  href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Namaskar%20Hotel%20Edesiea%2C%20inquiring%20about%20Booking%20Ref%3A%20${result.reference}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with Reception on WhatsApp</span>
                </a>

                <a
                  href={`tel:${HOTEL_INFO.phone}`}
                  className="py-3 px-4 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs rounded-lg flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4 text-[#C59B27]" />
                  <span>Call Hotel</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
