"use client";

import React from "react";
import { HOTEL_INFO } from "@/lib/constants";
import {
  MapPin,
  ExternalLink,
  Phone,
  Compass,
  Car,
  Clock,
  Sparkles,
  Train,
} from "lucide-react";

export default function LocationPage() {
  return (
    <div className="bg-[#FBF9F5] min-h-screen py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            Pali, Raigad, Maharashtra
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            Location & How to Reach Us
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Situated right on Shree Ballaleshwar Devshthan Temple Road in sacred Pali.
          </p>
        </div>

        {/* Map card and key details */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg grid grid-cols-1 lg:grid-cols-12">
          {/* Left Details (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 space-y-6 flex flex-col justify-between bg-slate-50 border-r border-slate-200">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#997316]">
                  Official Address
                </span>
                <p className="font-serif text-xl font-bold text-slate-900 mt-1">
                  {HOTEL_INFO.name}
                </p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                  {HOTEL_INFO.address}
                </p>
                <p className="text-xs text-[#997316] font-semibold mt-1">
                  {HOTEL_INFO.landmark}
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C59B27]" />
                  <a href={`tel:${HOTEL_INFO.phone}`} className="font-bold text-slate-900">
                    {HOTEL_INFO.phone}
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C59B27]" />
                  <span>24-Hour Front Desk Reception</span>
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
                <p className="font-bold">Pilgrim Assistance:</p>
                <p>
                  Need directions while driving into Pali or assistance with temple morning aarti timings? Message reception on WhatsApp!
                </p>
              </div>
            </div>

            <div className="pt-4">
              <a
                href={HOTEL_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#0E1A2B] hover:bg-[#1E2E44] text-[#E5C158] hover:text-white font-bold rounded-lg text-sm shadow transition-all"
              >
                <span>Open in Google Maps Navigation</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Visual Map Simulator (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center items-center bg-[#070E17] text-white space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#0E1A2B] border-2 border-[#C59B27] flex items-center justify-center text-[#E5C158] shadow-xl">
              <Compass className="w-8 h-8 animate-spin-slow" />
            </div>

            <div className="text-center space-y-2 max-w-md">
              <h3 className="font-serif text-2xl font-bold text-white">
                GPS Coordinates & Route
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hotel Edesiea is indexed directly on Google Maps. Tap below to launch turn-by-turn driving directions from your location.
              </p>
            </div>

            <a
              href={HOTEL_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold rounded-lg text-sm shadow-xl hover:brightness-110 transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Launch Google Maps Route</span>
            </a>
          </div>
        </div>

        {/* Nearby attractions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#997316] uppercase">
              <Sparkles className="w-4 h-4" />
              2 Mins Walk
            </div>
            <h4 className="font-serif text-lg font-bold text-slate-900">
              Shree Ballaleshwar Ganpati Mandir
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              One of the sacred 8 Ashtavinayak temples of Lord Ganesha, renowned for its stone architecture, massive bell, and divine spiritual peace.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#997316] uppercase">
              <Car className="w-4 h-4" />
              10 Mins Drive / Trek
            </div>
            <h4 className="font-serif text-lg font-bold text-slate-900">
              Historic Sarasgad Fort
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Twin pinnacles towering over Pali village, offering a thrilling 1.5-hour trek, panoramic valley views, and ancient water cisterns.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#997316] uppercase">
              <Car className="w-4 h-4" />
              15 Mins Drive
            </div>
            <h4 className="font-serif text-lg font-bold text-slate-900">
              Unhere Hot Water Springs
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Natural sulphur geothermal springs believed to have medicinal therapeutic benefits for skin and wellness, located just outside Pali.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
