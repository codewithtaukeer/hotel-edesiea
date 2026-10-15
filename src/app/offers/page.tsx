"use client";

import React from "react";
import Link from "next/link";
import { HOTEL_INFO } from "@/lib/constants";
import { Sparkles, CheckCircle2, MessageCircle, CalendarCheck, ShieldCheck } from "lucide-react";

export default function OffersPage() {
  const offers = [
    {
      title: "Book Direct & Best Rate Guarantee",
      discount: "Best Rates Guaranteed",
      desc: "Reserve directly through our official website or WhatsApp to receive the guaranteed lowest room rates with no third-party booking commissions.",
      badge: "Ongoing Direct Benefit",
      code: "DIRECTBOOK",
      action: "/booking",
    },
    {
      title: "Low Token Advance: Only ₹500 to Confirm",
      discount: "₹500 Deposit Only",
      desc: "Lock in your room category for upcoming weekends or Angaraki Chaturthi with only ₹500 token advance. Settle the balance upon arrival.",
      badge: "Pilgrim Friendly",
      code: "TOKEN500",
      action: "/booking",
    },
    {
      title: "Ashtavinayak Pilgrim Group Booking",
      discount: "Custom Group Rates",
      desc: "Planning a multi-family bus or tempo traveller pilgrimage to Pali? Contact reception directly on WhatsApp for customized multi-room bookings and catered Satvik/Jain thalis.",
      badge: "Group Enquiries",
      code: "YATRA2026",
      action: `https://wa.me/${HOTEL_INFO.whatsapp}?text=Hello%2C%20inquiry%20for%20Pilgrim%20Group%20Booking%20at%20Hotel%20Edesiea`,
      isExternal: true,
    },
  ];

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Special Privileges
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            Hotel Edesiea Offers & Packages
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Exclusive perks and seasonal pilgrim benefits available when booking direct.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-amber-50 text-[#997316] text-[11px] font-bold rounded-full border border-amber-200">
                  {offer.badge}
                </span>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  {offer.title}
                </h3>
                <p className="font-serif text-2xl font-extrabold text-[#0E1A2B]">
                  {offer.discount}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {offer.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                {offer.isExternal ? (
                  <a
                    href={offer.action}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire on WhatsApp</span>
                  </a>
                ) : (
                  <Link
                    href={offer.action}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#0E1A2B] hover:bg-[#1E2E44] text-[#E5C158] hover:text-white font-bold rounded-lg text-xs shadow transition-colors"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Book with this Offer</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
