"use client";

import React, { useState } from "react";
import { HOTEL_INFO } from "@/lib/constants";
import { useLanguage } from "@/components/LanguageContext";
import {
  Utensils,
  Clock,
  Users,
  Calendar,
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Phone,
} from "lucide-react";

export default function DiningReservationPage() {
  const { lang } = useLanguage();
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [diningDate, setDiningDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [diningTime, setDiningTime] = useState("13:00");
  const [partySize, setPartySize] = useState("4");
  const [floorPreference, setFloorPreference] = useState(
    "4th & 5th Floor Rooftop Fine Dining"
  );
  const [dietary, setDietary] = useState("Regular Pure Veg");
  const [specialNote, setSpecialNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Namaskar Hotel Edesiea! Table Reservation Enquiry:\n` +
      `• Name: ${guestName || "Guest"}\n` +
      `• Phone: ${guestPhone || "Not provided"}\n` +
      `• Date: ${diningDate}\n` +
      `• Time: ${diningTime}\n` +
      `• Guests: ${partySize} Persons\n` +
      `• Seating: ${floorPreference}\n` +
      `• Dietary: ${dietary}\n` +
      `• Special Requests: ${specialNote || "None"}`
  );

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Edelisa Authenticity Restaurant
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Table Reservation & Dining Enquiry
          </h1>
          <p className="mt-2 text-slate-600 text-sm max-w-xl mx-auto">
            Book your table for family celebrations, pilgrimage feasts, or quiet rooftop dinners overlooking the sacred Pali greenery.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-slate-900">
                Reservation Request Recorded!
              </h3>
              <p className="text-slate-600 text-sm max-w-md mx-auto">
                Thank you, {guestName}. Our restaurant steward at Pali has received your dining request for {partySize} guests on {diningDate} at {diningTime}.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm flex items-center justify-center gap-2 shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Confirmation on WhatsApp</span>
                </a>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg text-sm"
                >
                  Book Another Table
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patil"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={diningDate}
                    onChange={(e) => setDiningDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#C59B27]" />
                    Preferred Time
                  </label>
                  <select
                    value={diningTime}
                    onChange={(e) => setDiningTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm bg-white"
                  >
                    <option value="08:30">08:30 AM (Breakfast)</option>
                    <option value="10:00">10:00 AM (Breakfast)</option>
                    <option value="12:30">12:30 PM (Lunch)</option>
                    <option value="13:30">01:30 PM (Lunch)</option>
                    <option value="15:00">03:00 PM (Snacks & Tea)</option>
                    <option value="19:30">07:30 PM (Dinner)</option>
                    <option value="20:30">08:30 PM (Dinner)</option>
                    <option value="21:30">09:30 PM (Dinner)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C59B27]" />
                    Guests (Party Size)
                  </label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm bg-white"
                  >
                    <option value="2">2 Persons</option>
                    <option value="4">4 Persons</option>
                    <option value="6">6 Persons</option>
                    <option value="8">8 Persons</option>
                    <option value="12">12+ Persons (Family Group)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Seating Area Preference
                  </label>
                  <select
                    value={floorPreference}
                    onChange={(e) => setFloorPreference(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm bg-white"
                  >
                    <option value="4th & 5th Floor Rooftop Fine Dining">
                      4th & 5th Floor (Rooftop Fine Dining)
                    </option>
                    <option value="Ground Floor Café & Express Dosa">
                      Ground Floor (Express Dosa & Filter Coffee)
                    </option>
                    <option value="No Preference / Any Available">
                      No Preference / Any Available Table
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Dietary Requirements
                  </label>
                  <select
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm bg-white"
                  >
                    <option value="Regular Pure Veg">Regular Pure Vegetarian</option>
                    <option value="Strict Jain (No Onion/Garlic/Root Veg)">
                      Strict Jain (No Onion / Garlic / Root Veg)
                    </option>
                    <option value="Swaminarayan / Satvik">
                      Swaminarayan / Satvik
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Special Notes / Occasion (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Birthday celebration, prefer corner table, need baby high chair..."
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <a
                  href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Or book directly via WhatsApp (+91 8855887673)</span>
                </a>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 bg-[#0E1A2B] hover:bg-[#1E2E44] text-[#E5C158] hover:text-white font-bold rounded-lg text-sm shadow-md transition-all active:scale-95"
                >
                  Confirm Table Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
