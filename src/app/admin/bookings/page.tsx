"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  UserCheck,
  LogOut,
  AlertCircle,
  MessageCircle,
  Phone,
  BedDouble,
  X,
  Printer,
  ChevronDown,
} from "lucide-react";
import { HOTEL_INFO } from "@/lib/constants";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [notice, setNotice] = useState("");

  // New Walk-in form state
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [walkInCat, setWalkInCat] = useState("deluxe");
  const [walkInRoom, setWalkInRoom] = useState("101");
  const [walkInCheckIn, setWalkInCheckIn] = useState(todayStr);
  const [walkInCheckOut, setWalkInCheckOut] = useState(tomorrowStr);
  const [walkInPayMethod, setWalkInPayMethod] = useState("CASH");

  const fetchBookings = async () => {
    try {
      const url = `/api/bookings?status=${statusFilter}&search=${encodeURIComponent(
        search
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.bookings) setBookings(data.bookings);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleAction = async (bookingId: string, action: string, extraBody = {}) => {
    const token = localStorage.getItem("edesiea_staff_token");
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ...extraBody }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotice(data.message || `Action ${action} successful`);
        fetchBookings();
        setTimeout(() => setNotice(""), 4000);
      } else {
        alert(data.error || "Action failed");
      }
    } catch {
      alert("Error performing booking action");
    }
  };

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: walkInName,
          guestPhone: walkInPhone,
          categoryId: walkInCat,
          checkInDate: walkInCheckIn,
          checkOutDate: walkInCheckOut,
          paymentMethod: walkInPayMethod,
          roomId: walkInRoom,
          adults: 2,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowWalkInModal(false);
        setNotice(`Walk-in confirmed! Ref: ${data.bookingRef}`);
        fetchBookings();
        setWalkInName("");
        setWalkInPhone("");
        setTimeout(() => setNotice(""), 4000);
      } else {
        alert(data.error || "Failed to create walk-in");
      }
    } catch {
      alert("Error submitting walk-in booking");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#E5C158] font-bold">
            Front Desk Reception
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Bookings, Walk-ins & Guest Folios
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Register pilgrims, process check-ins/checkouts, and manage balance settlements.
          </p>
        </div>

        <button
          onClick={() => setShowWalkInModal(true)}
          className="px-5 py-2.5 bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold rounded-lg text-xs shadow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Walk-in Check-in</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Guest name, Phone, or EDE-XXXXXX..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#C59B27]"
          />
        </form>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
          {["ALL", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab
                    ? "bg-[#C59B27] text-slate-950 font-bold"
                    : "bg-slate-900 text-slate-300 hover:text-white border border-slate-700"
                }`}
              >
                {tab.replace("_", " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Room & Category</th>
                <th className="py-3 px-4">Stay Dates</th>
                <th className="py-3 px-4">Total / Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Reception Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {bookings.map((b) => {
                const assignedRoom = b.bookingRooms?.[0]?.room?.roomNumber;
                const categoryName = b.bookingRooms?.[0]?.category?.name || "Room";

                return (
                  <tr key={b.id} className="hover:bg-slate-750 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-white text-xs">
                        {b.bookingRef}
                      </span>
                      <span className="block text-[10px] text-slate-500">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{b.guest?.fullName}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <Phone className="w-3 h-3 text-[#C59B27]" />
                        <span>{b.guest?.phone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-200">
                        {categoryName}
                      </span>
                      <span className="block text-[11px] text-[#E5C158] font-bold">
                        {assignedRoom ? `Room ${assignedRoom}` : "Not Assigned"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px]">
                      <span>{b.checkInDate} to {b.checkOutDate}</span>
                      <span className="block text-slate-500">
                        ({b.totalNights} Night{b.totalNights > 1 ? "s" : ""})
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">
                        ₹{b.totalAmount.toLocaleString()}
                      </span>
                      <span
                        className={`block text-[11px] font-semibold ${
                          b.balanceDue > 0 ? "text-amber-400" : "text-emerald-400"
                        }`}
                      >
                        {b.balanceDue > 0
                          ? `Due: ₹${b.balanceDue.toLocaleString()}`
                          : "Settled ✓"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === "CONFIRMED"
                            ? "bg-blue-900/60 text-blue-200"
                            : b.status === "CHECKED_IN"
                            ? "bg-emerald-900/60 text-emerald-200"
                            : b.status === "CHECKED_OUT"
                            ? "bg-slate-700 text-slate-300"
                            : "bg-red-900/60 text-red-200"
                        }`}
                      >
                        {b.status.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() =>
                              handleAction(b.id, "CHECK_IN", {
                                roomId: assignedRoom || "101",
                              })
                            }
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold shadow"
                          >
                            Check In
                          </button>
                        )}

                        {b.status === "CHECKED_IN" && (
                          <button
                            onClick={() => handleAction(b.id, "CHECK_OUT")}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold shadow"
                          >
                            Check Out
                          </button>
                        )}

                        {b.status === "CONFIRMED" && (
                          <button
                            onClick={() => {
                              const reason = prompt("Enter cancellation reason:");
                              if (reason !== null) {
                                handleAction(b.id, "CANCEL", { reason });
                              }
                            }}
                            className="px-2 py-1 bg-slate-800 hover:bg-red-900 text-slate-400 hover:text-red-200 rounded text-[11px]"
                          >
                            Cancel
                          </button>
                        )}

                        <a
                          href={`https://wa.me/${
                            b.guest?.phone?.replace(/\D/g, "") || HOTEL_INFO.whatsapp
                          }?text=Namaskar%20${encodeURIComponent(
                            b.guest?.fullName || "Guest"
                          )}%2C%20regarding%20your%20Hotel%20Edesiea%20Booking%20(${b.bookingRef})`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-slate-800 text-emerald-400 hover:text-emerald-300 rounded"
                          title="WhatsApp Guest"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {bookings.length === 0 && !loading && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No reservations found. Use &apos;New Walk-in Check-in&apos; above to register incoming guests.
            </div>
          )}
        </div>
      </div>

      {/* Walk-in Reservation Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowWalkInModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#C59B27]" />
              <span>New Reception Walk-in Reservation</span>
            </h3>

            <form onSubmit={handleWalkInSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Balasaheb Shinde"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 88558 87673"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    required
                    value={walkInCheckIn}
                    onChange={(e) => setWalkInCheckIn(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    required
                    value={walkInCheckOut}
                    onChange={(e) => setWalkInCheckOut(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Room Category
                  </label>
                  <select
                    value={walkInCat}
                    onChange={(e) => setWalkInCat(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="deluxe">Deluxe Room (₹3,000)</option>
                    <option value="honeymoon">Honeymoon Suite (₹3,500)</option>
                    <option value="super-deluxe">Super Deluxe Room (₹4,000)</option>
                    <option value="suite">Royal Suite Room (₹6,500)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Assign Physical Room
                  </label>
                  <select
                    value={walkInRoom}
                    onChange={(e) => setWalkInRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="101">Room 101 (Deluxe)</option>
                    <option value="102">Room 102 (Deluxe)</option>
                    <option value="103">Room 103 (Deluxe)</option>
                    <option value="201">Room 201 (Honeymoon)</option>
                    <option value="202">Room 202 (Honeymoon)</option>
                    <option value="203">Room 203 (Honeymoon)</option>
                    <option value="301">Room 301 (Super Deluxe)</option>
                    <option value="302">Room 302 (Super Deluxe)</option>
                    <option value="303">Room 303 (Super Deluxe)</option>
                    <option value="401">Room 401 (Suite)</option>
                    <option value="402">Room 402 (Suite)</option>
                    <option value="403">Room 403 (Suite)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Payment Collection Method
                </label>
                <select
                  value={walkInPayMethod}
                  onChange={(e) => setWalkInPayMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="CASH">Cash at Reception</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / QR)</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="PAY_AT_HOTEL">Pay Later at Checkout</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold rounded-lg shadow"
                >
                  Confirm Walk-in Check-in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
