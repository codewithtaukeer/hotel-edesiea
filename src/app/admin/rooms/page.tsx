"use client";

import React, { useState, useEffect } from "react";
import {
  BedDouble,
  Sparkles,
  Wrench,
  Edit3,
  Save,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  ShieldCheck,
} from "lucide-react";

export default function AdminRoomsManagementPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [notice, setNotice] = useState<string>("");

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/admin/rooms");
      const data = await res.json();
      if (data.rooms) setRooms(data.rooms);
      if (data.categories) setCategories(data.categories);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleUpdatePrice = async (categoryId: string) => {
    const token = localStorage.getItem("edesiea_staff_token");
    try {
      const res = await fetch("/api/admin/rooms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "UPDATE_CATEGORY_PRICE",
          categoryId,
          newRate: editPrice,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotice(`Price updated to ₹${editPrice}`);
        setEditingCatId(null);
        fetchRooms();
        setTimeout(() => setNotice(""), 3000);
      } else {
        alert(data.error || "Failed to update price");
      }
    } catch {
      alert("Error updating price");
    }
  };

  const handleToggleHousekeeping = async (roomId: string, currentStatus: string) => {
    const newStatus = currentStatus === "CLEAN" ? "DIRTY" : "CLEAN";
    const token = localStorage.getItem("edesiea_staff_token");

    try {
      const res = await fetch("/api/admin/rooms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "UPDATE_ROOM_STATUS",
          roomId,
          housekeepingStatus: newStatus,
        }),
      });

      if (res.ok) {
        fetchRooms();
      }
    } catch {
      alert("Error updating room status");
    }
  };

  const handleToggleMaintenance = async (roomId: string, currentStatus: string) => {
    const newStatus =
      currentStatus === "AVAILABLE" ? "MAINTENANCE_BLOCKED" : "AVAILABLE";
    const token = localStorage.getItem("edesiea_staff_token");

    try {
      const res = await fetch("/api/admin/rooms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "UPDATE_ROOM_STATUS",
          roomId,
          operationalStatus: newStatus,
        }),
      });

      if (res.ok) {
        fetchRooms();
      } else {
        const data = await res.json();
        alert(data.error || "Permission denied");
      }
    } catch {
      alert("Error blocking/unblocking room");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#E5C158] font-bold">
            Front Desk Operations
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Physical Room Inventory & Rate Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live status of all 12 physical rooms in Pali. Change rates, toggle cleaning status, and block units for maintenance.
          </p>
        </div>

        <button
          onClick={fetchRooms}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* 1. ROOM RATES & CATEGORY CONTROLLER */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-md">
        <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
          <BedDouble className="w-5 h-5 text-[#C59B27]" />
          <span>Room Category Pricing (Editable as Hotel Admin)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="font-serif text-base font-bold text-white">
                    {cat.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {cat.totalRooms} Rooms
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{cat.tagline}</p>
              </div>

              {editingCatId === cat.id ? (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full pl-6 pr-2 py-1.5 bg-slate-950 border border-[#C59B27] rounded text-sm font-bold text-white focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleUpdatePrice(cat.id)}
                    className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                    title="Save Price"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingCatId(null)}
                    className="p-1.5 bg-slate-800 text-slate-400 rounded hover:text-white"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[11px] text-slate-400">Current Base Rate</span>
                    <p className="font-serif text-xl font-bold text-[#E5C158]">
                      ₹{cat.basePrice.toLocaleString()}{" "}
                      <span className="text-[10px] font-normal text-slate-400">/ night</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingCatId(cat.id);
                      setEditPrice(cat.basePrice.toString());
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded text-xs font-semibold flex items-center gap-1 border border-slate-700"
                  >
                    <Edit3 className="w-3 h-3 text-[#C59B27]" />
                    <span>Change</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. PHYSICAL ROOMS LIVE MATRIX (12 UNITS) */}
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-white">
              Physical Room Inventory Matrix (12 Rooms)
            </h3>
            <p className="text-xs text-slate-400">
              Cleanliness (Housekeeping) and Operational Status (Maintenance) are independent concerns.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Clean
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Dirty
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Blocked
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const isBlocked = room.operationalStatus === "MAINTENANCE_BLOCKED";
            const isClean = room.housekeepingStatus === "CLEAN";
            const activeBooking = room.bookingRooms?.[0]?.booking;

            return (
              <div
                key={room.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isBlocked
                    ? "bg-red-950/20 border-red-500/40"
                    : activeBooking
                    ? "bg-blue-950/20 border-blue-500/40"
                    : "bg-slate-900 border-slate-700 hover:border-slate-500"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-serif text-2xl font-bold text-white">
                        Room {room.roomNumber}
                      </span>
                      <p className="text-[11px] text-[#E5C158] font-semibold">
                        {room.category?.name} • Floor {room.floor}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isBlocked
                          ? "bg-red-900/60 text-red-200"
                          : activeBooking
                          ? "bg-blue-900/60 text-blue-200"
                          : "bg-emerald-900/60 text-emerald-200"
                      }`}
                    >
                      {isBlocked
                        ? "Blocked"
                        : activeBooking
                        ? "Occupied"
                        : "Available"}
                    </span>
                  </div>

                  {/* Active guest info */}
                  {activeBooking && (
                    <div className="mt-3 p-2 bg-blue-950/40 rounded border border-blue-500/30 text-xs text-blue-200 space-y-0.5">
                      <p className="font-bold truncate">👤 {activeBooking.guest.fullName}</p>
                      <p className="text-[11px] text-blue-300">
                        {activeBooking.checkInDate} to {activeBooking.checkOutDate}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Toggles */}
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Housekeeping:</span>
                    <button
                      onClick={() =>
                        handleToggleHousekeeping(room.id, room.housekeepingStatus)
                      }
                      className={`px-2.5 py-1 rounded font-bold text-[11px] transition-all ${
                        isClean
                          ? "bg-emerald-900/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-800/40"
                          : "bg-amber-900/40 text-amber-300 border border-amber-500/30 hover:bg-amber-800/40"
                      }`}
                    >
                      {isClean ? "✓ Clean & Ready" : "⚠ Dirty (Needs Clean)"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Maintenance:</span>
                    <button
                      onClick={() =>
                        handleToggleMaintenance(room.id, room.operationalStatus)
                      }
                      className={`px-2.5 py-1 rounded font-semibold text-[11px] transition-all ${
                        isBlocked
                          ? "bg-red-900/50 text-red-200 border border-red-500/40 hover:bg-red-800/50"
                          : "bg-slate-800 text-slate-300 border border-slate-700 hover:text-white"
                      }`}
                    >
                      {isBlocked ? "Unblock Room" : "Block for Maintenance"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
