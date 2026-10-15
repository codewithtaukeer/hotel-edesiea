"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
  Phone,
  Clock,
  Receipt,
  ShieldCheck,
} from "lucide-react";

export default function HotelSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    hotelName: "Hotel Edesiea",
    legalName: "Hotel Edesiea & Edelisa Authenticity Restaurant",
    tagline: "Authentic Flavors · Timeless Hospitality",
    taglineMr: "अस्सल चव · अविस्मरणीय आतिथ्य",
    address: "Shree Ballaleshwar Devshthan Temple Road, Pali, Maharashtra 410205, India",
    pinCode: "410205",
    landmark: "Near Shree Ballaleshwar Ganpati Temple (Ashtavinayak)",
    phone: "+91 8855887673",
    whatsapp: "918855887673",
    emailPrimary: "edesieaoffice@gmail.com",
    checkInTime: "12:00 PM",
    checkOutTime: "11:00 AM",
    advanceDepositAmount: 500,
    cancellationHoursLimit: 48,
    restaurantGstRate: 5.0,
    roomGstRate: 12.0,
    gstin: "",
    isBookingOpen: true,
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setForm((prev) => ({
            ...prev,
            ...data.settings,
          }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSavedSuccess(false);

    const token = localStorage.getItem("edesiea_staff_token");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update settings");
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      }
    } catch {
      setError("Network error updating settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#E5C158] font-bold">
            Administrative Control Panel
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Hotel Business & Operational Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage official Pali hotel profile, statutory GST, check-in rules, and booking policies.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold rounded-lg text-xs shadow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Configuration"}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Hotel configuration saved to database and recorded in audit log.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Official Identity */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-[#E5C158] flex items-center gap-2 border-b border-slate-700 pb-2">
            <Building className="w-4 h-4" />
            1. Hotel Identity & Physical Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Official Business Name
              </label>
              <input
                type="text"
                value={form.hotelName}
                onChange={(e) => setForm({ ...form, hotelName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-1 focus:ring-[#C59B27]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Legal Billing Name (for Invoices)
              </label>
              <input
                type="text"
                value={form.legalName}
                onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:ring-1 focus:ring-[#C59B27]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tagline (English)
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tagline (Marathi - मराठी)
              </label>
              <input
                type="text"
                value={form.taglineMr}
                onChange={(e) => setForm({ ...form, taglineMr: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Complete Physical Address (Pali, Raigad)
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Key Landmark
              </label>
              <input
                type="text"
                value={form.landmark}
                onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                value={form.pinCode}
                onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* 2. Contact & Front Desk Channels */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-[#E5C158] flex items-center gap-2 border-b border-slate-700 pb-2">
            <Phone className="w-4 h-4" />
            2. Verified Communication Channels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telephone (Reception Desk)
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp Number (without +)
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Primary Official Email
              </label>
              <input
                type="email"
                value={form.emailPrimary}
                onChange={(e) => setForm({ ...form, emailPrimary: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Operational Rules & Advance Payment */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-[#E5C158] flex items-center gap-2 border-b border-slate-700 pb-2">
            <Clock className="w-4 h-4" />
            3. Operational Timings, Advance & Cancellation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Standard Check-in Time
              </label>
              <input
                type="text"
                value={form.checkInTime}
                onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Standard Check-out Time
              </label>
              <input
                type="text"
                value={form.checkOutTime}
                onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Advance Deposit (₹)
              </label>
              <input
                type="number"
                value={form.advanceDepositAmount}
                onChange={(e) =>
                  setForm({ ...form, advanceDepositAmount: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cancellation Window (Hours)
              </label>
              <input
                type="number"
                value={form.cancellationHoursLimit}
                onChange={(e) =>
                  setForm({ ...form, cancellationHoursLimit: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* 4. Statutory Taxes & Invoicing */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-6 space-y-4">
          <h3 className="font-serif text-base font-bold text-[#E5C158] flex items-center gap-2 border-b border-slate-700 pb-2">
            <Receipt className="w-4 h-4" />
            4. Statutory GST Taxes & Invoicing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Restaurant GST Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.restaurantGstRate}
                onChange={(e) =>
                  setForm({ ...form, restaurantGstRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                5.0% = 2.5% CGST + 2.5% SGST (as per bill EAR_649)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Room Stay GST Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.roomGstRate}
                onChange={(e) =>
                  setForm({ ...form, roomGstRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard 12% for rooms ₹1,001–₹7,500
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                GSTIN Number
              </label>
              <input
                type="text"
                placeholder="27XXXXXXXXXXXZX"
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white font-mono uppercase"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold rounded-lg text-sm shadow hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
}
