"use client";

import React, { useState } from "react";
import { HOTEL_INFO } from "@/lib/constants";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Sparkles,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const whatsappMsg = encodeURIComponent(
    `Hello Hotel Edesiea! Query from ${name || "Guest"}:\n${message}`
  );

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Always at Your Service
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            Contact Hotel Edesiea
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Our Pali front desk and dining stewards are available to assist with room bookings, table reservations, and directions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif text-xl font-bold text-slate-900 border-b pb-2">
                Pali Reception Desk
              </h3>

              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Hotel Edesiea</p>
                    <p className="text-xs text-slate-600">{HOTEL_INFO.address}</p>
                    <p className="text-xs text-[#997316] font-medium mt-0.5">
                      {HOTEL_INFO.landmark}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#C59B27] shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Direct Front Desk Phone</p>
                    <a
                      href={`tel:${HOTEL_INFO.phone}`}
                      className="font-bold text-slate-900 hover:text-[#C59B27]"
                    >
                      {HOTEL_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">WhatsApp Reservations</p>
                    <a
                      href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Hello%20Hotel%20Edesiea`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-700 hover:text-emerald-800"
                    >
                      {HOTEL_INFO.whatsappDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#C59B27] shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Official Email</p>
                    <p className="font-medium text-xs text-slate-900">
                      edesieaoffice@gmail.com
                    </p>
                    <p className="text-[11px] text-slate-500">
                      taukeerakbar.code@mail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#C59B27] shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400">Operating Hours</p>
                    <p className="font-medium text-xs text-slate-900">
                      Reception: 24/7 | Restaurant: 7:30 AM – 11:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0E1A2B] text-white p-6 rounded-2xl border border-[#C59B27]/40 space-y-3">
              <h4 className="font-serif font-bold text-lg text-[#E5C158]">
                Instant WhatsApp Chat
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Skip form filling—connect with our reception manager in Pali directly on WhatsApp for instant confirmation.
              </p>
              <a
                href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Namaskar%20Hotel%20Edesiea%2C%20I%20have%20an%20enquiry.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Launch WhatsApp (+91 8855887673)</span>
              </a>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
            {sent ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  Message Sent to Hotel Edesiea
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, {name}. Our front desk at Pali has received your message and will respond promptly via call or WhatsApp.
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=${whatsappMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Also Send on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-serif text-2xl font-bold text-slate-900">
                  Send a Direct Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anand Joshi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 88558 87673"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    How Can We Assist You? *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Specify stay dates, number of rooms needed, dining inquiry, or special pilgrimage arrangements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-[#C59B27]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#0E1A2B] hover:bg-[#1E2E44] text-[#E5C158] hover:text-white font-bold rounded-lg text-sm shadow transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-[#C59B27]" />
                  <span>Send Message to Pali Reception</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
