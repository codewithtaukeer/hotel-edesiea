"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { HOTEL_INFO } from "@/lib/constants";
import { useLanguage } from "./LanguageContext";

export default function WhatsAppFloatingButton() {
  const [showTooltip, setShowTooltip] = useState(true);
  const { lang } = useLanguage();

  const message = encodeURIComponent(
    "Namaskar Hotel Edesiea! I am inquiring about room availability & restaurant bookings."
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end flex-col gap-2 pointer-events-auto">
      {showTooltip && (
        <div className="relative bg-[#0E1A2B] text-white text-xs px-3.5 py-2 rounded-xl shadow-2xl border border-[#C59B27]/40 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -right-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-full p-0.5 border border-white/20"
            aria-label="Close tooltip"
          >
            <X className="w-3 h-3" />
          </button>
          <p className="font-semibold text-[#E5C158] flex items-center gap-1">
            <span>💬</span>
            {lang === "mr" ? "त्वरित व्हॉट्सॲप सहाय्य" : "Need Instant Help?"}
          </p>
          <p className="text-slate-200 text-[11px] mt-0.5">
            {lang === "mr"
              ? "खोल्यांचे आरक्षण किंवा माहितीसाठी थेट मेसेज करा."
              : "Chat directly with Pali reception for room booking & temple darshan queries."}
          </p>
        </div>
      )}

      <a
        href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Hotel Edesiea on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-2xl shadow-emerald-600/40 hover:scale-110 active:scale-95 transition-all"
      >
        <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-30 group-hover:opacity-60 animate-ping"></span>
        <MessageCircle className="w-7 h-7 fill-white/20" />
      </a>
    </div>
  );
}
