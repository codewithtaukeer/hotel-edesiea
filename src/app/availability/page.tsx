"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ROOM_CATEGORIES, HOTEL_INFO } from "@/lib/constants";
import {
  Calendar,
  Users,
  Search,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export default function AvailabilityPage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guests, setGuests] = useState("2");
  const [isSearched, setIsSearched] = useState(true);

  // Compute stay duration
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diffTime = Math.max(d2.getTime() - d1.getTime(), 86400000);
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Live Room Availability Engine
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            Check Room Availability
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Select your stay dates to view available rooms across all 4 categories at Hotel Edesiea, Pali.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsSearched(true);
            }}
            className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                Check-in Date
              </label>
              <input
                type="date"
                required
                min={todayStr}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                Check-out Date
              </label>
              <input
                type="date"
                required
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C59B27]" />
                Guests
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27] bg-white"
              >
                <option value="1">1 Adult (Solo)</option>
                <option value="2">2 Adults (Couple)</option>
                <option value="3">3 Adults (Triple)</option>
                <option value="4">4 Adults (Suite)</option>
              </select>
            </div>

            <button
              type="submit"
              className="py-3 px-4 bg-[#0E1A2B] hover:bg-[#1E2E44] text-[#E5C158] hover:text-white font-bold rounded-lg text-sm shadow transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-[#C59B27]" />
              <span>Update Availability</span>
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>
              Stay Duration: <strong>{nights} Night(s)</strong> ({checkIn} to {checkOut})
            </span>
            <span className="text-emerald-700 font-semibold">
              ✓ Only ₹500 advance deposit required to confirm
            </span>
          </div>
        </div>

        {/* Results listing */}
        <div className="space-y-6">
          <h2 className="font-serif text-2xl font-bold text-slate-900 text-center sm:text-left">
            Available Rooms for Selected Dates ({nights} Night{nights > 1 ? "s" : ""})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ROOM_CATEGORIES.map((cat) => {
              const totalStayPrice = cat.pricePerNight * nights;
              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row"
                >
                  <div className="sm:w-1/2 relative h-48 sm:h-auto min-h-[180px] bg-slate-100">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#0E1A2B]/85 text-[#E5C158] text-[11px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                      {cat.totalRooms} Rooms in Inventory
                    </div>
                  </div>

                  <div className="sm:w-1/2 p-5 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif text-xl font-bold text-slate-900">
                          {cat.name}
                        </h3>
                        <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded">
                          Available
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {cat.description}
                      </p>

                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-slate-700 font-medium">
                          • {cat.bedType} (Max {cat.maxAdults} adults)
                        </p>
                        <p className="text-xs text-slate-700 font-medium">
                          • AC, Wi-Fi, 24/7 Hot Water, Temple Proximity
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] text-slate-400">Total for {nights} Night(s)</p>
                        <p className="font-serif text-lg font-bold text-[#0E1A2B]">
                          ₹{totalStayPrice.toLocaleString()}
                        </p>
                      </div>

                      <Link
                        href={`/booking?checkIn=${encodeURIComponent(
                          checkIn
                        )}&checkOut=${encodeURIComponent(
                          checkOut
                        )}&guests=${guests}&category=${cat.id}`}
                        className="px-4 py-2 bg-[#0E1A2B] hover:bg-[#1E2E44] text-[#E5C158] font-bold text-xs rounded-lg shadow"
                      >
                        Book (₹500 Adv)
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
