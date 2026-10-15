"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MENU_ITEMS, MENU_CATEGORIES, HOTEL_INFO } from "@/lib/constants";
import { useLanguage } from "@/components/LanguageContext";
import {
  Utensils,
  Search,
  Sparkles,
  Check,
  MessageCircle,
  Receipt,
  Clock,
  Filter,
  Flame,
} from "lucide-react";

export default function RestaurantPage() {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [jainOnly, setJainOnly] = useState<boolean>(false);

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCat =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJain = !jainOnly || item.isJainAvailable;
    return matchesCat && matchesSearch && matchesJain;
  });

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-12">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4" />
          100% Pure Vegetarian Culinary Experience
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
          Edelisa Authenticity Restaurant
        </h1>
        <p className="font-serif text-base sm:text-xl text-[#997316] italic mt-2">
          &ldquo;फक्त जेवण नाही, तर एक सुंदर Dining Experience.&rdquo;
        </p>
        <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-sm">
          Ground Floor (South Indian & Breakfast Café) and 4th & 5th Floor (Fine Dining Maharashtrian & Multi-cuisine).
        </p>
      </div>

      {/* Visual Menu Feature Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-[#C59B27] rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Dining Hours</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Breakfast: 7:30 AM – 12:00 PM <br />
                Lunch & Dinner: 11:30 AM – 11:00 PM
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Pure Desi Ghee & Spices</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Sajuk Tup, authentic Konkani thecha, fresh coconut, and pure vegetarian prep.
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Transparent GST Billing</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Official Bill Receipt format (CGST 2.5% + SGST 2.5% = 5% GST).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes (e.g., Dosa, Thali, Paneer, Misal)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#C59B27] text-sm"
            />
          </div>

          {/* Jain Filter Toggle */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={jainOnly}
                onChange={(e) => setJainOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                🌿 Show Jain Special Options Only
              </span>
            </label>

            <Link
              href="/dining"
              className="px-4 py-2 bg-[#0E1A2B] text-[#E5C158] text-xs font-bold rounded-lg hover:bg-[#1E2E44] transition-colors"
            >
              Reserve Table
            </Link>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 min-w-max pb-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "All"
                ? "bg-[#0E1A2B] text-[#E5C158] shadow-md"
                : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
            }`}
          >
            All Items ({MENU_ITEMS.length})
          </button>
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? "bg-[#0E1A2B] text-[#E5C158] shadow-md"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border border-emerald-600 p-0.5 flex items-center justify-center rounded-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      </span>
                      <h3 className="font-serif font-bold text-slate-900 text-base">
                        {item.name}
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block mt-1">
                      {item.category}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-serif text-lg font-bold text-slate-900">
                      ₹{item.price}
                    </span>
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 p-2 rounded">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  {item.isChefSpecial && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Flame className="w-3 h-3 text-amber-500" />
                      Chef Special
                    </span>
                  )}
                  {item.isJainAvailable && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Jain Available
                    </span>
                  )}
                </div>

                <a
                  href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Hello%2C%20I%20would%20like%20to%20order%20or%20inquire%20about%20${encodeURIComponent(
                    item.name
                  )}%20(₹${item.price})`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Enquire</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 my-8">
            <p className="text-slate-500 text-sm">No dishes found matching your search.</p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setJainOnly(false);
              }}
              className="mt-3 px-4 py-2 bg-[#0E1A2B] text-[#E5C158] text-xs font-bold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Authentic Bill Receipt Showcase */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="bg-[#0E1A2B] text-white rounded-2xl p-6 sm:p-10 border border-[#C59B27]/40 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5C158]">
              Verified Operations
            </span>
            <h3 className="font-serif text-2xl font-bold">
              Authentic Billing & Dining Quality
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every guest receipt at Edelisa Authenticity Restaurant follows standard statutory compliance with 2.5% CGST and 2.5% SGST. Our kitchen uses only top-grade ingredients, pure butter, paneer, and farm-fresh produce.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={`https://wa.me/${HOTEL_INFO.whatsapp}?text=Hello%2C%20I%20want%20to%20reserve%20a%20dining%20table%20at%20Edelisa%20Restaurant.`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Reserve via WhatsApp</span>
              </a>
              <Link
                href="/dining"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg border border-white/20"
              >
                Book Table Online
              </Link>
            </div>
          </div>

          <div className="md:col-span-5 flex justify-center">
            <div className="relative w-56 h-72 rounded-xl overflow-hidden border-2 border-[#C59B27] shadow-2xl bg-white p-2">
              <Image
                src="/images/receipt-sample.png"
                alt="Authentic Hotel Edesiea Printed Bill"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
