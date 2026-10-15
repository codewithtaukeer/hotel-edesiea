"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BedDouble,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Utensils,
  Wrench,
  TrendingUp,
  Sparkles,
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRooms: 12,
    availableRooms: 10,
    occupiedRooms: 2,
    cleanRooms: 10,
    dirtyRooms: 2,
    todayArrivals: 2,
    todayDepartures: 1,
    pendingHolds: 1,
    activeMaintenance: 0,
    dailyCollections: 14250,
  });

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E1A2B] p-6 rounded-2xl border border-[#C59B27]/40 shadow-lg">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#E5C158] font-bold">
            Hotel Edesiea Management Operations
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Operations & Front Desk Overview
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Pali, Raigad, Maharashtra • Near Shree Ballaleshwar Mandir
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/bookings"
            className="px-4 py-2 bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold rounded-lg text-xs shadow hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>New Walk-in Check-in</span>
          </Link>
          <Link
            href="/admin/restaurant"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg text-xs border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Utensils className="w-4 h-4 text-[#E5C158]" />
            <span>Table POS Billing</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rooms Availability */}
        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 shadow flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Room Inventory</p>
              <h3 className="font-serif text-3xl font-extrabold text-white mt-1">
                {stats.availableRooms} / {stats.totalRooms}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-950/60 text-emerald-400 rounded-lg border border-emerald-500/30">
              <BedDouble className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">Available Today</span>
            <span>{stats.occupiedRooms} Occupied</span>
          </div>
        </div>

        {/* Housekeeping Board */}
        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 shadow flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Housekeeping</p>
              <h3 className="font-serif text-3xl font-extrabold text-white mt-1">
                {stats.cleanRooms} <span className="text-sm font-normal text-slate-400">Clean</span>
              </h3>
            </div>
            <div className="p-2.5 bg-amber-950/60 text-amber-400 rounded-lg border border-amber-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs text-slate-400">
            <span className="text-amber-400 font-medium">{stats.dirtyRooms} Dirty / Pending</span>
            <Link href="/admin/housekeeping" className="text-[#E5C158] hover:underline">
              Inspect Board →
            </Link>
          </div>
        </div>

        {/* Today's Front Desk Flow */}
        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 shadow flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Today's Traffic</p>
              <h3 className="font-serif text-3xl font-extrabold text-white mt-1">
                {stats.todayArrivals} <span className="text-sm font-normal text-slate-400">In</span> / {stats.todayDepartures} <span className="text-sm font-normal text-slate-400">Out</span>
              </h3>
            </div>
            <div className="p-2.5 bg-blue-950/60 text-blue-400 rounded-lg border border-blue-500/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs text-slate-400">
            <span>Check-in: 12 PM</span>
            <span>Check-out: 11 AM</span>
          </div>
        </div>

        {/* Today's Collections */}
        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700/80 shadow flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Daily Collections</p>
              <h3 className="font-serif text-3xl font-extrabold text-[#E5C158] mt-1">
                ₹{stats.dailyCollections.toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-950/60 text-[#E5C158] rounded-lg border border-[#C59B27]/30">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between text-xs text-slate-400">
            <span className="text-emerald-400 font-medium">100% Reconciled</span>
            <Link href="/admin/finance" className="text-[#E5C158] hover:underline">
              Daily Ledger →
            </Link>
          </div>
        </div>
      </div>

      {/* Real 12 Physical Rooms Live Status Board */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              Physical Room Inventory (12 Units Total)
            </h3>
            <p className="text-xs text-slate-400">
              Separate operational availability from housekeeping clean status.
            </p>
          </div>
          <Link
            href="/admin/rooms"
            className="text-xs text-[#E5C158] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Manage Rates & Overrides</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
          {[
            { num: "101", cat: "Deluxe", price: 3000, state: "Clean", busy: false },
            { num: "102", cat: "Deluxe", price: 3000, state: "Clean", busy: false },
            { num: "103", cat: "Deluxe", price: 3000, state: "Dirty", busy: false },
            { num: "201", cat: "Honeymoon", price: 3500, state: "Clean", busy: true, guest: "Patil (In-house)" },
            { num: "202", cat: "Honeymoon", price: 3500, state: "Clean", busy: false },
            { num: "203", cat: "Honeymoon", price: 3500, state: "Clean", busy: false },
            { num: "301", cat: "Super Deluxe", price: 4000, state: "Clean", busy: false },
            { num: "302", cat: "Super Deluxe", price: 4000, state: "Clean", busy: true, guest: "Deshmukh" },
            { num: "303", cat: "Super Deluxe", price: 4000, state: "Dirty", busy: false },
            { num: "401", cat: "Suite Room", price: 6500, state: "Clean", busy: false },
            { num: "402", cat: "Suite Room", price: 6500, state: "Clean", busy: false },
            { num: "403", cat: "Suite Room", price: 6500, state: "Clean", busy: false },
          ].map((r) => (
            <div
              key={r.num}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                r.busy
                  ? "bg-red-950/30 border-red-500/40"
                  : r.state === "Dirty"
                  ? "bg-amber-950/30 border-amber-500/40"
                  : "bg-slate-900 border-slate-700 hover:border-emerald-500/50"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-serif text-lg font-bold text-white">
                  Room {r.num}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    r.busy
                      ? "bg-red-900/60 text-red-200"
                      : "bg-emerald-900/60 text-emerald-200"
                  }`}
                >
                  {r.busy ? "Occupied" : "Vacant"}
                </span>
              </div>

              <div className="mt-2 text-[11px] space-y-0.5">
                <p className="text-[#E5C158] font-semibold">{r.cat}</p>
                <p className="text-slate-400">₹{r.price.toLocaleString()}/night</p>
                {r.guest && (
                  <p className="text-slate-200 font-medium truncate">
                    👤 {r.guest}
                  </p>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-white/10 flex justify-between items-center text-[10px]">
                <span
                  className={
                    r.state === "Clean"
                      ? "text-emerald-400 font-semibold"
                      : "text-amber-400 font-semibold"
                  }
                >
                  ● {r.state}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
