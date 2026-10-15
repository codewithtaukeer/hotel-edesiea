"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ROOM_CATEGORIES, HOTEL_INFO, RoomCategory } from "@/lib/constants";
import { useLanguage } from "@/components/LanguageContext";
import {
  CheckCircle2,
  Users,
  Maximize2,
  CalendarCheck,
  MessageCircle,
  Sparkles,
  Wifi,
  Wind,
  Coffee,
  X,
  ShieldCheck,
} from "lucide-react";

export default function RoomsPage() {
  const { lang } = useLanguage();
  const [selectedRoom, setSelectedRoom] = useState<RoomCategory | null>(null);

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-12">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Best Rates Guaranteed Direct
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
          Rooms & Luxury Suites
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Every room is designed with serene Konkani comfort, air-conditioning, custom embroidered linens, modern bathrooms, and swift temple access.
        </p>
      </div>

      {/* Room Listing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {ROOM_CATEGORIES.map((room, idx) => (
          <div
            key={room.id}
            className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 ${
              idx % 2 === 1 ? "lg:flex-row-reverse" : ""
            }`}
          >
            {/* Left Photo (5 cols) */}
            <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full bg-slate-100 overflow-hidden group">
              <Image
                src={room.image}
                alt={room.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 left-4 bg-[#0E1A2B]/90 text-[#E5C158] text-xs font-bold px-3 py-1 rounded-md backdrop-blur-md border border-[#C59B27]/40">
                {room.totalRooms} Physical Rooms Total
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/60 backdrop-blur-md text-white p-3 rounded-lg text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  <Users className="w-4 h-4 text-[#E5C158]" />
                  Max {room.maxAdults} Adults + {room.maxChildren} Child
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Maximize2 className="w-4 h-4 text-[#E5C158]" />
                  {room.sizeSqFt} sq.ft
                </span>
              </div>
            </div>

            {/* Right Information (7 cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                      {lang === "mr" ? room.nameMr : room.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#997316] font-medium mt-1">
                      {room.tagline}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0E1A2B]">
                      ₹{room.pricePerNight.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">per night + taxes</p>
                  </div>
                </div>

                <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                  {lang === "mr" ? room.descriptionMr : room.description}
                </p>

                {/* Amenities grid */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Configured Inclusions & Facilities:
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {room.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-md">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Book with ₹500 advance deposit</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedRoom(room)}
                    className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:border-[#0E1A2B] text-xs font-semibold transition-colors"
                  >
                    View Room Policy
                  </button>

                  <a
                    href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Hello%2C%20I%20am%20inquiring%20about%20booking%20the%20${encodeURIComponent(
                      room.name
                    )}%20at%20Hotel%20Edesiea.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                    title="Inquire on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>

                  <Link
                    href={`/booking?category=${room.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0E1A2B] hover:bg-[#1E2E44] text-[#E5C158] hover:text-white font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Book Now</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room Policy Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setSelectedRoom(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-slate-900">
              {selectedRoom.name} — Stay Details
            </h3>
            <p className="text-xs text-[#997316] font-medium mt-0.5">
              ₹{selectedRoom.pricePerNight.toLocaleString()} / night
            </p>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-bold text-slate-900 mb-1">Standard Timings:</p>
                <p>• Check-in: 12:00 PM (Noon)</p>
                <p>• Check-out: 11:00 AM (Extensions subject to availability)</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-bold text-slate-900 mb-1">Advance & Payment:</p>
                <p>• ₹500 advance payment secures a confirmed reservation.</p>
                <p>• Remaining balance payable at reception upon check-in via UPI, Card, or Cash.</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
                <p className="font-bold mb-1">Cancellation Rule:</p>
                <p>{HOTEL_INFO.cancellationPolicyNotice}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <Link
                href={`/booking?category=${selectedRoom.id}`}
                className="px-5 py-2 bg-[#0E1A2B] text-[#E5C158] font-bold text-xs rounded-lg shadow"
              >
                Proceed to Book Room
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
