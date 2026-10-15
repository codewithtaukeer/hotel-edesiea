"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HOTEL_INFO } from "@/lib/constants";
import { HelpCircle, ChevronDown, MessageCircle, Sparkles } from "lucide-react";

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "How close is Hotel Edesiea to Shree Ballaleshwar Ganpati Temple in Pali?",
      a: "Hotel Edesiea is situated directly on Temple Road, less than a 2-minute leisurely walk from the sacred temple gates. This makes early morning Kakad Aarti (5:30 AM) and evening aarti exceptionally convenient for families and elderly devotees.",
    },
    {
      q: "What are your standard Check-in and Check-out timings?",
      a: "Standard Check-in is 12:00 PM (Noon) and Check-out is 11:00 AM. Early check-in or late checkout can be accommodated subject to room availability on the day of stay. Please coordinate with our reception in advance.",
    },
    {
      q: "What is your Room Booking Advance and Cancellation Policy?",
      a: "To confirm a direct room booking, only a ₹500 token advance is required. Cancellations are permitted free of charge up to 2 days (48 hours) prior to check-in by messaging our reception on WhatsApp (+91 8855887673). Within 48 hours of check-in, bookings become non-refundable.",
    },
    {
      q: "Is the restaurant 100% Pure Vegetarian, and do you serve Jain food?",
      a: "Yes! Edelisa Authenticity Restaurant is strictly 100% pure vegetarian with dedicated cookware. We offer a full Jain Special Menu (prepared without onion, garlic, or root vegetables) across breakfast, dosas, soups, curries, and thalis.",
    },
    {
      q: "What room categories do you offer and how many rooms are there?",
      a: "We offer 4 distinct room categories with 12 physical rooms in total: Deluxe Room (₹3,000/night), Honeymoon Suite (₹3,500/night), Super Deluxe Room (₹4,000/night), and Royal Suite Room (₹6,500/night). Each category has 3 physical rooms.",
    },
    {
      q: "Is vehicle parking available at Hotel Edesiea in Pali?",
      a: "Yes, dedicated parking is available for guests arriving by personal cars, SUVs, and pilgrim traveler tempo buses.",
    },
    {
      q: "Can we organize multi-room bookings for pilgrim groups or family events?",
      a: "Absolutely. We routinely host Ashtavinayak pilgrim groups and family gatherings. Contact our reception on WhatsApp (+91 8855887673) for customized group packages and tailored dining menus.",
    },
  ];

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            Guest Assistance & Information
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Everything you need to know about your pilgrimage stay, dining, and policies at Hotel Edesiea.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif font-bold text-slate-900 text-base sm:text-lg hover:text-[#997316] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[#C59B27] shrink-0 transition-transform duration-200 ${
                    openIdx === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIdx === i && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-[#0E1A2B] text-white rounded-2xl p-6 sm:p-8 text-center space-y-4 border border-[#C59B27]/40">
          <h3 className="font-serif text-xl font-bold text-[#E5C158]">
            Have a Specific Question Not Listed Here?
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Our Pali front desk team is online 24/7 on WhatsApp to answer any query regarding room availability, meals, or temple darshan.
          </p>
          <a
            href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Namaskar%20Hotel%20Edesiea%2C%20I%20have%20a%20question.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp (+91 8855887673)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
