"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { HOTEL_INFO, ROOM_CATEGORIES, MENU_ITEMS } from "@/lib/constants";
import {
  Calendar,
  Users,
  Search,
  MessageCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Utensils,
  MapPin,
  Clock,
  Coffee,
  Wifi,
  Wind,
  PhoneCall,
  Star,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { lang, t } = useLanguage();

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState("2");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      `/booking?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(
        checkOut
      )}&guests=${guests}&category=${selectedCategory}`
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION WITH REAL BUILDING FACADE */}
      <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center bg-[#070E17] text-white overflow-hidden">
        {/* Background photo with subtle zoom and overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hotel-exterior-banner.png"
            alt="Hotel Edesiea Pali Exterior Facade"
            fill
            className="object-cover object-center brightness-75 scale-105 transition-transform duration-1000 ease-out"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A2B] via-[#0E1A2B]/60 to-[#070E17]/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center flex flex-col items-center">
          {/* Pilgrimage location badge */}
          <div className="inline-flex items-center gap-2 bg-[#0E1A2B]/85 border border-[#C59B27]/50 rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold tracking-wider text-[#E5C158] mb-6 shadow-xl backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#C59B27]" />
            <span>{t.hero.subtitle}</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-400">100% PURE VEG RETREAT</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-tight drop-shadow-md">
            Hotel Edesiea
          </h1>

          <p className="mt-3 font-serif text-lg sm:text-2xl text-[#E5C158] italic tracking-wide">
            {lang === "mr" ? HOTEL_INFO.taglineMr : HOTEL_INFO.tagline}
          </p>

          <p className="mt-5 text-sm sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed drop-shadow">
            {lang === "mr"
              ? "श्री बल्लाळेश्वर देवस्थान मंदिर मार्ग, पाली येथे स्थित. शांत व निसर्गरम्य वातावरण, रुफटॉप शुद्ध शाकाहारी रेस्टॉरंट आणि आरामदायक खोल्या."
              : "A peaceful hospitality retreat moments from sacred Shree Ballaleshwar Ganpati Temple in Pali, Raigad. Authentic pure-veg dining and boutique luxury stays."}
          </p>

          {/* Value proposition pill */}
          <div className="mt-6 inline-flex items-center gap-2 bg-black/40 border border-[#C59B27]/30 rounded-lg px-4 py-2 text-xs sm:text-sm text-[#F7F0D4] backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-[#C59B27]" />
            <span className="font-medium">
              {lang === "mr"
                ? "थेट बुकिंग करा • फक्त ₹५०० टोकन ॲडव्हान्समध्ये आरक्षण निश्चित करा"
                : "Book Direct • Secure Room with Only ₹500 Advance Deposit"}
            </span>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <a
              href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Hello%20Hotel%20Edesiea%2C%20I%20want%20to%20check%20room%20availability%20for%20my%20stay.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-lg shadow-xl shadow-emerald-700/30 text-sm transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-white/20" />
              <span>{t.hero.whatsappBooking}</span>
            </a>

            <Link
              href="/rooms"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-lg border border-white/20 hover:border-white/40 text-sm backdrop-blur-md transition-all"
            >
              <span>{t.hero.exploreRooms}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME BOOKING & AVAILABILITY SEARCH BAR */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 w-full">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#C59B27]/40 p-4 sm:p-6 text-slate-900">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                {t.bookingBar.checkIn}
              </label>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#C59B27]" />
                {t.bookingBar.checkOut}
              </label>
              <input
                type="date"
                value={checkOut}
                min={checkIn || today}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#C59B27]" />
                {t.bookingBar.guests}
              </label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm font-medium bg-white"
              >
                <option value="1">1 Adult (Solo Guest)</option>
                <option value="2">2 Adults (Couple / Pair)</option>
                <option value="3">3 Adults (Family)</option>
                <option value="4">4 Adults (Suite)</option>
                <option value="5">5+ Guests (Multi-room group)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Room Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm font-medium bg-white"
              >
                <option value="all">All Available Rooms</option>
                {ROOM_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (₹{cat.pricePerNight})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#0E1A2B] to-[#1E2E44] text-[#E5C158] hover:text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#070E17] active:scale-95 transition-all text-sm"
            >
              <Search className="w-4 h-4 text-[#C59B27]" />
              <span>{t.bookingBar.searchRooms}</span>
            </button>
          </form>

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.bookingBar.advanceNotice}
            </span>
            <span className="text-slate-400">
              Check-in: 12:00 PM • Check-out: 11:00 AM • Free 48-hr Cancellation
            </span>
          </div>
        </div>
      </section>

      {/* 3. ASHTAVINAYAK TEMPLE PROXIMITY HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-[#FAF7F2] rounded-2xl p-6 sm:p-10 border border-[#C59B27]/30 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#997316]">
              <Sparkles className="w-4 h-4" />
              Sacred Heritage Location
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              {lang === "mr"
                ? "श्री बल्लाळेश्वर गणपती मंदिराच्या पावन सानिध्यात"
                : "Moments Away from Sacred Shree Ballaleshwar Ganpati Temple"}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              {lang === "mr"
                ? "अष्टविनायकांपैकी एक असलेल्या श्री बल्लाळेश्वर मंदिरापासून अवघ्या २ मिनिटांच्या अंतरावर हॉटेल एडेसिया वसलेले आहे. भाविकांसाठी शुद्ध सात्विक जेवण, स्वच्छ व शांत खोल्या आणि मंदिर दर्शनासाठी आवश्यक ते सर्व मार्गदर्शन येथे उपलब्ध आहे."
                : "Hotel Edesiea is situated right on Temple Road, just a 2-minute stroll to one of the revered Ashtavinayak Ganpati temples. Ideal for devotees, families, and leisure travelers exploring the historic beauty of Pali, Sarasgad Fort, and Unhere hot springs."}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                2 mins walk to Temple
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                10 mins to Sarasgad Fort Trek
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                15 mins to Unhere Hot Springs
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#C59B27]/40 shadow-md text-center space-y-3">
            <h3 className="font-serif font-bold text-slate-900 text-lg">
              {lang === "mr" ? "थेट फोनवर आरक्षण" : "Need Quick Assistance?"}
            </h3>
            <p className="text-xs text-slate-500">
              Contact our front desk directly for group bookings, wedding parties, and temple timings.
            </p>
            <a
              href={`tel:${HOTEL_INFO.phone}`}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#0E1A2B] text-[#E5C158] font-bold rounded-lg text-sm hover:bg-slate-800 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call: {HOTEL_INFO.phone}</span>
            </a>
            <a
              href={HOTEL_INFO.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs text-[#997316] hover:text-[#0E1A2B] underline font-medium"
            >
              <MapPin className="w-3.5 h-3.5" />
              View Location & Driving Map
            </a>
          </div>
        </div>
      </section>

      {/* 4. FEATURED ROOM CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#997316]">
              {t.roomsSection.title}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
              Curated Accommodations in Pali
            </h2>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              {t.roomsSection.subtitle}
            </p>
          </div>
          <Link
            href="/rooms"
            className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-[#0E1A2B] hover:text-[#C59B27] transition-colors"
          >
            <span>View All 4 Categories & Details</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ROOM_CATEGORIES.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Photo with real embroidered towels banner */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0E1A2B]/85 text-[#E5C158] text-[11px] font-bold px-2.5 py-1 rounded backdrop-blur-sm border border-[#C59B27]/40">
                  {room.bedType}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 text-slate-900 text-xs font-extrabold px-3 py-1 rounded-md shadow">
                  ₹{room.pricePerNight.toLocaleString()} <span className="text-[10px] font-normal text-slate-600">/ night</span>
                </div>
              </div>

              {/* Room Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    {lang === "mr" ? room.nameMr : room.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {lang === "mr" ? room.descriptionMr : room.description}
                  </p>

                  <div className="mt-3.5 space-y-1.5">
                    {room.amenities.slice(0, 4).map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <Link
                    href={`/booking?category=${room.id}`}
                    className="flex-1 text-center py-2.5 px-3 bg-[#0E1A2B] hover:bg-[#1E2E44] text-[#E5C158] hover:text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                  >
                    {t.roomsSection.bookThisRoom}
                  </Link>
                  <a
                    href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Hello%20Hotel%20Edesiea%2C%20is%20the%20${encodeURIComponent(
                      room.name
                    )}%20available%20for%20booking%3F`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-colors"
                    title="Ask on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. RESTAURANT & AUTHENTIC MENU HIGHLIGHT */}
      <section className="bg-[#0E1A2B] text-white py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Mosaic of Real Uploaded Restaurant Photos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative h-64 rounded-xl overflow-hidden border border-[#C59B27]/40 shadow-xl">
                  <Image
                    src="/images/thali-special.jpg"
                    alt="Authentic Edesiea Thali Presentation"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-[#0E1A2B]/80 text-[#E5C158] text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur">
                    Authentic Thali
                  </div>
                </div>
                <div className="relative h-44 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                  <Image
                    src="/images/restaurant-interior.png"
                    alt="Tree-Canopy Architecture Hall"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="relative h-44 rounded-xl overflow-hidden border border-white/20 shadow-lg">
                  <Image
                    src="/images/restaurant-dining.png"
                    alt="Live Edelisa Dining Room"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-64 rounded-xl overflow-hidden border border-[#C59B27]/40 shadow-xl bg-slate-900 flex flex-col justify-end p-5">
                  <span className="text-[#E5C158] text-xs font-bold uppercase tracking-wider">
                    Ground + 4th & 5th Floor
                  </span>
                  <h4 className="font-serif text-xl font-bold text-white mt-1">
                    Edelisa Authenticity Restaurant
                  </h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    &ldquo;फक्त जेवण नाही, तर एक सुंदर Dining Experience.&rdquo;
                  </p>
                  <p className="text-[11px] text-emerald-400 font-semibold mt-2">
                    GST 5% (CGST 2.5% + SGST 2.5%) as per receipt EAR_649
                  </p>
                </div>
              </div>
            </div>

            {/* Restaurant Info & Highlights */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#1B2B3E] border border-[#C59B27]/40 rounded-full px-3.5 py-1 text-xs text-[#E5C158] font-semibold">
                <Utensils className="w-3.5 h-3.5" />
                {t.restaurantSection.badge}
              </div>

              <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Authentic Maharashtrian, South Indian & Global Flavors
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Whether relishing a morning Ghee Thatte Idli & filter coffee on our ground floor café, or enjoying our renowned Special Chaturthi Thali on the rooftop overlooking Pali hills, every dish is prepared pure-vegetarian with genuine devotion and local Konkani ingredients.
              </p>

              {/* Thali pricing badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400">Punjabi Thali</p>
                  <p className="font-serif text-xl font-bold text-[#E5C158] mt-0.5">₹200</p>
                </div>
                <div className="bg-white/5 border border-[#C59B27]/40 rounded-lg p-3 text-center">
                  <p className="text-xs text-[#E5C158]">Maharashtrian Thali</p>
                  <p className="font-serif text-xl font-bold text-[#E5C158] mt-0.5">₹349</p>
                </div>
                <div className="bg-white/5 border border-emerald-500/30 rounded-lg p-3 text-center">
                  <p className="text-xs text-emerald-400">Special Chaturthi Thali</p>
                  <p className="font-serif text-xl font-bold text-white mt-0.5">₹449</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/restaurant"
                  className="inline-flex items-center gap-2 bg-[#C59B27] hover:bg-[#E5C158] text-slate-950 font-bold px-6 py-3 rounded-lg text-sm transition-all"
                >
                  <Utensils className="w-4 h-4" />
                  <span>{t.restaurantSection.viewFullMenu}</span>
                </Link>

                <Link
                  href="/dining"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg border border-white/20 text-sm transition-all"
                >
                  <span>{t.restaurantSection.reserveTable}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. GENUINE GUEST REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#997316]">
            Devotee & Traveler Experiences
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            Cherished Words from Our Guests
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Verified pilgrimage stays, family vacations, and authentic dining reviews at Pali.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                &ldquo;We visited Pali for Shree Ballaleshwar darshan with my elderly parents. Hotel Edesiea was ideal—just 2 minutes from the temple. The rooms were spotless, AC was crisp, and the pure-veg food was delicious!&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">Sunil Deshmukh</p>
                <p className="text-xs text-slate-500">Pune • Family Pilgrimage</p>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                Verified Stay
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#C59B27]/40 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                &ldquo;The Maharashtrian Thali and Chaturthi Thali on the rooftop are unmatched! The Sajuk Tup with puran poli and authentic mass vadi reminded us of ancestral feasts. Best restaurant in Pali.&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">Priyanka & Rajesh Patil</p>
                <p className="text-xs text-slate-500">Mumbai • Weekend Trip</p>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                Dining & Stay
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500" />
                ))}
              </div>
              <p className="text-sm text-slate-700 italic leading-relaxed">
                &ldquo;Booking was smooth on WhatsApp, advance was only ₹500, and checkout timing was flexible. The manager guided us on Sarasgad trekking and temple morning aarti. Highly recommended!&rdquo;
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 text-sm">Aniket Kulkarni</p>
                <p className="text-xs text-slate-500">Thane • Solo Trekker</p>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                Verified Stay
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHATSAPP & DIRECT BOOKING ACTION BANNER */}
      <section className="bg-gradient-to-r from-[#0E1A2B] via-[#102A43] to-[#0E1A2B] text-white py-14 border-y border-[#C59B27]/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-1 border border-emerald-500/30">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            {t.whatsappBanner.title}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            {t.whatsappBanner.desc}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Namaskar%20Hotel%20Edesiea%2C%20I%20would%20like%20to%20book%20a%20stay.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-lg shadow-xl text-base transition-all active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t.whatsappBanner.button}</span>
            </a>

            <Link
              href="/booking"
              className="inline-flex items-center gap-2 bg-[#C59B27] hover:bg-[#E5C158] text-slate-950 font-bold px-8 py-3.5 rounded-lg shadow-xl text-base transition-all active:scale-95"
            >
              <Calendar className="w-5 h-5" />
              <span>Instant Online Booking (₹500 Advance)</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
