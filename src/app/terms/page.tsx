"use client";

import React from "react";
import Link from "next/link";
import { HOTEL_INFO } from "@/lib/constants";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="bg-[#FBF9F5] min-h-screen py-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Terms of Service & Privacy Policy
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Last Updated: October 2026 • Hotel Edesiea, Pali, Raigad, Maharashtra
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6 text-slate-700 text-sm leading-relaxed">
          <div className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              1. Guest Data Privacy & Information Protection
            </h2>
            <p>
              Hotel Edesiea respects guest privacy. Personal data collected (including name, telephone/WhatsApp number, email address, and government identification) is utilized solely for legal guest registration compliance, booking confirmations, billing, and direct WhatsApp communication regarding your stay. We do not sell or rent guest contact information to third-party marketing services.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              2. Payment Security & Integrity
            </h2>
            <p>
              Online advance payments are processed through secure, PCI-DSS compliant payment gateways. We never store credit or debit card numbers, CVVs, or gateway secret keys on our servers. All financial transactions are verified cryptographically via server-side verification before booking confirmation.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-lg font-bold text-slate-900">
              3. Right of Admission & Decorum
            </h2>
            <p>
              Management reserves the right of admission. As Hotel Edesiea is situated in the spiritual precinct of Shree Ballaleshwar Mandir in Pali, guests are required to maintain peaceful decorum. The property operates as a 100% pure-vegetarian and alcohol-free premises.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>Hotel Edesiea Management, Pali</span>
            <Link href="/contact" className="hover:text-slate-900 underline">
              Inquiries: {HOTEL_INFO.phone}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
