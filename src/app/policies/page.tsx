"use client";

import React from "react";
import Link from "next/link";
import { HOTEL_INFO } from "@/lib/constants";
import { ShieldCheck, Clock, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

export default function PoliciesPage() {
  return (
    <div className="bg-[#FBF9F5] min-h-screen py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            Transparent Hospitality Standards
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            Hotel Edesiea Policies
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Operational guidelines for check-in, bookings, payments, and cancellations in Pali, Maharashtra.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1: Check-in / Checkout */}
          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C59B27]" />
              1. Check-in & Check-out Timings
            </h2>
            <ul className="space-y-1.5 pl-6 list-disc text-slate-600">
              <li>
                <strong>Standard Check-in Time:</strong> 12:00 PM (Noon).
              </li>
              <li>
                <strong>Standard Check-out Time:</strong> 11:00 AM.
              </li>
              <li>
                <strong>Early Check-in / Late Check-out:</strong> Complimentary early check-in is subject to room availability upon arrival. For guaranteed early arrivals before 9:00 AM, reserving the prior night is recommended.
              </li>
              <li>
                <strong>Government ID Verification:</strong> Valid government-issued photo identification (Aadhaar Card, Passport, Voter ID, or Driving License) is mandatory for all adult guests at check-in as per Maharashtra State hospitality regulations.
              </li>
            </ul>
          </div>

          {/* Section 2: Advance & Payment */}
          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C59B27]" />
              2. Advance Deposit & Balance Settlement
            </h2>
            <ul className="space-y-1.5 pl-6 list-disc text-slate-600">
              <li>
                A confirmed online reservation requires an advance deposit of <strong>₹500 per room</strong>.
              </li>
              <li>
                Provisional reservations can also be initiated with arrival availability confirmation via WhatsApp.
              </li>
              <li>
                The remaining balance is due upon check-in at the hotel reception desk and can be settled via UPI (Google Pay, PhonePe, Paytm), Credit/Debit Card, or Cash.
              </li>
              <li>
                Official GST bills and receipts are generated upon check-out.
              </li>
            </ul>
          </div>

          {/* Section 3: Cancellation & Refunds */}
          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              3. Cancellation, Rescheduling & Refund Rules
            </h2>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-2">
              <p className="font-semibold">
                Official 48-Hour Cancellation Window:
              </p>
              <p>
                Guests may cancel or reschedule their stay free of charge by contacting reception on WhatsApp (<strong>+91 8855887673</strong>) up to <strong>2 days (48 hours) prior to the 12:00 PM check-in date</strong>.
              </p>
              <p>
                Cancellations requested within 48 hours of check-in, as well as no-shows, are strictly non-refundable and the advance token will be forfeited to compensate for held inventory.
              </p>
            </div>
          </div>

          {/* Section 4: Pure Veg & Property Decorum */}
          <div className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              4. Pure Vegetarian & Sanctity Standards
            </h2>
            <ul className="space-y-1.5 pl-6 list-disc text-slate-600">
              <li>
                Hotel Edesiea and Edelisa Restaurant are strictly <strong>100% pure vegetarian</strong>. Non-vegetarian food and outside non-veg parcels are strictly prohibited on the hotel premises.
              </li>
              <li>
                Given our close proximity to the holy Shree Ballaleshwar Ganpati Temple, alcohol consumption and disorderly conduct are strictly prohibited.
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Last Updated: October 2026</span>
            <Link href="/contact" className="text-[#0E1A2B] font-bold underline">
              Contact Reception with Any Policy Questions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
