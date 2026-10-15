"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { HOTEL_INFO } from "@/lib/constants";
import { useLanguage } from "@/components/LanguageContext";
import { Sparkles, CheckCircle2, ShieldCheck, Heart, MapPin, Coffee } from "lucide-react";

export default function AboutPage() {
  const { lang } = useLanguage();

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-14">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Timeless Konkani Hospitality
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            About Hotel Edesiea
          </h1>
          <p className="font-serif text-lg text-[#997316] italic">
            {lang === "mr" ? HOTEL_INFO.taglineMr : HOTEL_INFO.tagline}
          </p>
        </div>

        {/* Real photo hero */}
        <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border-2 border-[#C59B27]/40 shadow-xl">
          <Image
            src="/images/hotel-exterior-banner.png"
            alt="Hotel Edesiea Pali Facade"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 sm:p-8">
            <p className="text-white text-sm sm:text-base max-w-2xl font-medium drop-shadow">
              A serene multi-floor hotel and restaurant located moments from Shree Ballaleshwar Ganpati Temple on Temple Road, Pali, Raigad.
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-slate-900">
              Our Vision: Sacred Pilgrimage & Unrivaled Comfort
            </h2>
            <p>
              Hotel Edesiea was founded with a singular commitment: to provide devotees, families, and travelers visiting holy Pali with a warm, pristine sanctuary of authentic flavors and peaceful rest.
            </p>
            <p>
              Located in the scenic foothills beneath Sarasgad Fort, Pali is historically famous as the only Ashtavinayak temple named after a devoted pilgrim (Ballal). We emulate this timeless spirit of service, treating every visitor with genuine reverence and individualized care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <Coffee className="w-5 h-5 text-[#C59B27]" />
                Edelisa Pure-Veg Restaurant
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Spanning our Ground Floor South Indian express café and 4th & 5th floor rooftop fine dining hall, our kitchen serves over 150 authentic pure-vegetarian delicacies, traditional Maharashtrian Thalis, and dedicated Jain specialties prepared with desi ghee and uncompromised hygiene.
              </p>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Boutique Room Inventory
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                With 12 physical rooms across Deluxe, Honeymoon Suite, Super Deluxe, and Royal Suites, we maintain high standards of cleanliness, fresh custom-embroidered linens, 24/7 hot water, high-speed Wi-Fi, and crisp air-conditioning.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-900">Visiting Pali this week?</p>
              <p className="text-xs text-slate-500">Contact our Pali reception desk for temple timings and direct booking.</p>
            </div>
            <Link
              href="/booking"
              className="px-6 py-3 bg-[#0E1A2B] text-[#E5C158] hover:text-white font-bold rounded-lg text-sm shadow transition-colors"
            >
              Book Direct (From ₹3,000/night)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
