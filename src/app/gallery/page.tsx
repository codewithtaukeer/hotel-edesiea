"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Camera } from "lucide-react";

export default function GalleryPage() {
  const [filter, setFilter] = useState("all");

  const photos = [
    {
      src: "/images/hotel-exterior-banner.png",
      title: "Hotel Edesiea Exterior & Facade",
      category: "hotel",
      desc: "Architectural facade on Shree Ballaleshwar Devshthan Temple Road, Pali.",
    },
    {
      src: "/images/room-real.png",
      title: "Custom Appointed Rooms",
      category: "rooms",
      desc: "Deluxe bedding featuring branded embroidered Edesiea linens, AC, and tranquil lighting.",
    },
    {
      src: "/images/restaurant-dining.png",
      title: "Edelisa Dining Hall",
      category: "restaurant",
      desc: "Multicuisine pure-veg restaurant with artisan tree-canopy architecture.",
    },
    {
      src: "/images/restaurant-interior.png",
      title: "Rooftop Restaurant Hall",
      category: "restaurant",
      desc: "Modern light-filled dining space for families, groups, and pilgrim feasts.",
    },
    {
      src: "/images/thali-special.jpg",
      title: "A Feast of North Indian & Maharashtrian Flavors",
      category: "food",
      desc: "Authentic Edesiea Thali served with pure desi ghee, puran poli, and seasonal curries.",
    },
    {
      src: "/images/receipt-sample.png",
      title: "Statutory Transparent Billing",
      category: "hotel",
      desc: "Authentic printed customer invoice showing 5% GST (CGST 2.5% + SGST 2.5%).",
    },
  ];

  const filteredPhotos =
    filter === "all" ? photos : photos.filter((p) => p.category === filter);

  return (
    <div className="bg-[#FBF9F5] min-h-screen py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#0E1A2B] text-[#E5C158] px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Camera className="w-3.5 h-3.5" />
            Visual Experience
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            Hotel Edesiea Gallery
          </h1>
          <p className="mt-2 text-slate-600 text-sm max-w-xl mx-auto">
            Authentic glimpses of our rooms, restaurant halls, handcrafted pure-veg delicacies, and surroundings in Pali.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex justify-center gap-2 mb-10 flex-wrap">
          {[
            { id: "all", label: "All Photos" },
            { id: "hotel", label: "Hotel & Facade" },
            { id: "rooms", label: "Rooms & Suites" },
            { id: "restaurant", label: "Restaurant & Ambience" },
            { id: "food", label: "Cuisine & Thalis" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                filter === tab.id
                  ? "bg-[#0E1A2B] text-[#E5C158] shadow-md"
                  : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
            >
              <div className="relative h-64 w-full bg-slate-100 overflow-hidden">
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-base">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">{photo.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
