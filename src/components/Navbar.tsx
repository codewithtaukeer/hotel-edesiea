"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { HOTEL_INFO } from "@/lib/constants";
import {
  Menu as MenuIcon,
  X,
  Phone,
  MessageCircle,
  CalendarCheck,
  Globe,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/rooms", label: t.nav.rooms },
    { href: "/restaurant", label: t.nav.restaurant },
    { href: "/dining", label: t.nav.dining },
    { href: "/about", label: t.nav.about },
    { href: "/gallery", label: t.nav.gallery },
    { href: "/location", label: t.nav.location },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0E1A2B]/95 backdrop-blur-md border-b border-[#C59B27]/30 text-white transition-all shadow-lg">
      {/* Top micro-bar */}
      <div className="bg-[#070E17] text-xs py-1.5 px-4 sm:px-8 border-b border-white/5 flex flex-wrap justify-between items-center text-slate-300">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-[#E5C158] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            {HOTEL_INFO.landmark}
          </span>
          <span className="hidden md:inline-block text-white/40">|</span>
          <span className="hidden md:flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            100% Pure Veg Dining & Stays
          </span>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <a
            href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Hello%20Hotel%20Edesiea%2C%20I%20want%20to%20inquire%20about%20a%20booking.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-emerald-500/20" />
            <span className="font-semibold">{HOTEL_INFO.whatsappDisplay}</span>
          </a>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-0.5 border border-white/15 text-[11px]">
            <Globe className="w-3 h-3 text-[#E5C158]" />
            <button
              onClick={() => setLang("en")}
              className={`px-1.5 py-0.5 rounded-full transition-all ${
                lang === "en"
                  ? "bg-[#C59B27] text-slate-900 font-bold"
                  : "hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("mr")}
              className={`px-1.5 py-0.5 rounded-full transition-all ${
                lang === "mr"
                  ? "bg-[#C59B27] text-slate-900 font-bold"
                  : "hover:text-white"
              }`}
            >
              मराठी
            </button>
          </div>

          <Link
            href="/admin/login"
            className="hidden sm:flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-[#C59B27]" />
            <span>{t.nav.adminPortal}</span>
          </Link>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-1 border-2 border-[#C59B27] shadow-md group-hover:scale-105 transition-transform">
            <Image
              src="/images/logo.png"
              alt="Hotel Edesiea Logo"
              width={48}
              height={48}
              className="object-contain w-full h-full"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-white group-hover:text-[#E5C158] transition-colors">
              HOTEL EDESIEA
            </span>
            <span className="text-[10px] sm:text-xs text-[#E5C158] uppercase tracking-widest font-medium">
              {lang === "mr" ? HOTEL_INFO.taglineMr : HOTEL_INFO.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? "text-[#E5C158] bg-white/10 font-semibold"
                    : "text-slate-200 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/lookup"
            className="text-xs text-slate-300 hover:text-white px-2.5 py-1.5 border border-white/20 rounded-md hover:border-white/40 transition-colors"
          >
            My Booking
          </Link>

          <Link
            href="/booking"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold px-4 py-2.5 rounded-md hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#C59B27]/20 text-sm"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{t.nav.bookNow}</span>
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-[#0E1A2B] border-b border-[#C59B27]/40 px-4 pt-3 pb-6 space-y-2 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? "bg-[#C59B27] text-slate-950 font-bold"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/booking"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold py-3 rounded-lg text-sm shadow-md"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{t.nav.bookNow} (Advance ₹500 Only)</span>
            </Link>

            <a
              href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Namaskar%20Hotel%20Edesiea%2C%20I%20want%20to%20book%20a%20room.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Booking (+91 8855887673)</span>
            </a>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-2 px-1">
              <Link
                href="/lookup"
                onClick={() => setIsOpen(false)}
                className="underline hover:text-white"
              >
                Check Existing Booking Status
              </Link>
              <Link
                href="/admin/login"
                onClick={() => setIsOpen(false)}
                className="text-[#E5C158] hover:underline"
              >
                Staff Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
