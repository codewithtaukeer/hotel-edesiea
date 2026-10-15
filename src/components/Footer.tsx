"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { HOTEL_INFO } from "@/lib/constants";
import { useLanguage } from "./LanguageContext";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldAlert,
  ExternalLink,
  MessageCircle,
  Heart,
  ChevronRight,
} from "lucide-react";

export default function Footer() {
  const { lang, t } = useLanguage();

  return (
    <footer className="bg-[#070E17] text-white border-t-2 border-[#C59B27]/40 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Col 1: Hotel Brand & Heritage */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-1 border-2 border-[#C59B27]">
                <Image
                  src="/images/logo.png"
                  alt="Hotel Edesiea Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-wide text-white">
                  HOTEL EDESIEA
                </h3>
                <p className="text-xs text-[#E5C158] font-medium tracking-wider">
                  {lang === "mr" ? HOTEL_INFO.taglineMr : HOTEL_INFO.tagline}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              {lang === "mr"
                ? "श्री बल्लाळेश्वर गणपती मंदिराच्या पावन भूमीत, पाली येथे १००% शुद्ध शाकाहारी भोजन आणि आरामदायी निसर्गरम्य निवासाचा आनंद घ्या."
                : "A premier pure-vegetarian hospitality retreat situated moments from the historic Ashtavinayak Shree Ballaleshwar Ganpati Temple in Pali, Raigad."}
            </p>

            <div className="pt-2">
              <span className="inline-block px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold rounded-full">
                ✓ 100% Pure Veg (South Indian, Maharashtrian & Multi-cuisine)
              </span>
            </div>
          </div>

          {/* Col 2: Verified Address & Directions */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-[#E5C158] tracking-wider uppercase border-b border-white/10 pb-2">
              {lang === "mr" ? "पत्ता व संपर्क" : "Address & Contact"}
            </h4>

            <div className="flex items-start gap-2.5 text-sm text-slate-300">
              <MapPin className="w-5 h-5 text-[#E5C158] shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-white">{HOTEL_INFO.address}</p>
                <p className="text-xs text-[#E5C158] mt-1">{HOTEL_INFO.landmark}</p>
              </div>
            </div>

            <a
              href={HOTEL_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#E5C158] hover:text-white underline font-semibold transition-colors mt-1"
            >
              <span>{lang === "mr" ? "गुगल मॅप्सवर पहा" : "Open in Google Maps"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="pt-2 space-y-1.5 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#E5C158]" />
                <a href={`tel:${HOTEL_INFO.phone}`} className="hover:text-white">
                  {HOTEL_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <a
                  href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Hello%20Hotel%20Edesiea`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  WhatsApp: {HOTEL_INFO.whatsappDisplay}
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-4 h-4 text-[#E5C158]" />
                <span>edesieaoffice@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Col 3: Timings & Operating Policies */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-[#E5C158] tracking-wider uppercase border-b border-white/10 pb-2">
              {lang === "mr" ? "वेळा आणि नियम" : "Hours & Policies"}
            </h4>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#E5C158] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Check-in / Check-out:</p>
                  <p>Check-in: 12:00 PM (Noon)</p>
                  <p>Check-out: 11:00 AM</p>
                </div>
              </div>

              <div className="pt-1">
                <p className="font-semibold text-white">Restaurant Hours:</p>
                <p>Breakfast: 7:30 AM – 12:00 PM</p>
                <p>Lunch & Dinner: 11:30 AM – 11:00 PM</p>
              </div>

              <div className="pt-2 p-2.5 bg-amber-950/40 border border-amber-600/30 rounded text-amber-200">
                <p className="font-semibold flex items-center gap-1 text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {lang === "mr" ? "रद्दीकरण धोरण" : "Cancellation Rule"}
                </p>
                <p className="text-[11px] mt-0.5 leading-snug">
                  {lang === "mr"
                    ? "बुकिंग रद्द करण्यासाठी चेक-इनच्या २ दिवस आधी व्हॉट्सॲपवर संपर्क करा. नंतर रद्द केल्यास रक्कम परत मिळणार नाही."
                    : "Free cancellation up to 48 hours prior to check-in via WhatsApp. Strictly non-refundable within 48 hours."}
                </p>
              </div>
            </div>
          </div>

          {/* Col 4: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-[#E5C158] tracking-wider uppercase border-b border-white/10 pb-2">
              {t.footer.quickLinks}
            </h4>

            <ul className="space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/rooms" className="hover:text-[#E5C158] flex items-center gap-1 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#C59B27]" />
                  {t.nav.rooms} (from ₹3,000/night)
                </Link>
              </li>
              <li>
                <Link href="/restaurant" className="hover:text-[#E5C158] flex items-center gap-1 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#C59B27]" />
                  {t.nav.restaurant} (150+ Pure Veg Items)
                </Link>
              </li>
              <li>
                <Link href="/dining" className="hover:text-[#E5C158] flex items-center gap-1 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#C59B27]" />
                  {t.nav.dining}
                </Link>
              </li>
              <li>
                <Link href="/lookup" className="hover:text-[#E5C158] flex items-center gap-1 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#C59B27]" />
                  Booking Status / Lookup
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#E5C158] flex items-center gap-1 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#C59B27]" />
                  {t.nav.faq}
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-[#E5C158] flex items-center gap-1 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5 text-[#C59B27]" />
                  {t.nav.policies}
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-[#E5C158] flex items-center gap-1 transition-colors text-xs text-slate-400">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  Staff ERP & Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} {HOTEL_INFO.legalName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/policies" className="hover:text-white underline">
              Booking Policy
            </Link>
            <Link href="/terms" className="hover:text-white underline">
              Terms & Privacy
            </Link>
            <Link href="/location" className="hover:text-white underline">
              Pali Temple Guide
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
