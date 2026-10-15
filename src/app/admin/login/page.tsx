"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@hoteledesiea.com");
  const [password, setPassword] = useState("Edesiea@Pali2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const sampleRoles = [
    { label: "Owner / Super Admin", email: "admin@hoteledesiea.com", role: "SUPER_ADMIN" },
    { label: "General Manager", email: "manager@hoteledesiea.com", role: "HOTEL_MANAGER" },
    { label: "Front Desk Receptionist", email: "reception@hoteledesiea.com", role: "RECEPTIONIST" },
    { label: "Housekeeping Lead", email: "housekeeping@hoteledesiea.com", role: "HOUSEKEEPING" },
    { label: "Restaurant Manager", email: "restaurant@hoteledesiea.com", role: "RESTAURANT_MANAGER" },
    { label: "Head Chef / Kitchen", email: "kitchen@hoteledesiea.com", role: "KITCHEN" },
    { label: "Accountant / Finance", email: "accounts@hoteledesiea.com", role: "ACCOUNTANT" },
    { label: "Maintenance Lead", email: "maintenance@hoteledesiea.com", role: "MAINTENANCE" },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("edesiea_staff_token", data.token);
      localStorage.setItem("edesiea_staff_user", JSON.stringify(data.user));
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError("Network or server error during login");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070E17] text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-white p-1 border-2 border-[#C59B27] shadow-xl flex items-center justify-center">
          <Image
            src="/images/logo.png"
            alt="Hotel Edesiea"
            width={52}
            height={52}
            className="object-contain"
          />
        </div>
        <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-white">
          Hotel Edesiea Staff ERP
        </h2>
        <p className="mt-1 text-xs text-[#E5C158] font-medium tracking-wider uppercase">
          Authorized Management & Operations Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#0E1A2B] py-8 px-6 shadow-2xl border border-[#C59B27]/40 rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-lg text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#C59B27]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold rounded-lg text-sm shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Staff Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Development Quick Role Switcher */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#C59B27]" />
              Quick Select Role (Testing & Verification):
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {sampleRoles.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setEmail(r.email);
                    setPassword("Edesiea@Pali2026");
                  }}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-[11px] text-left text-slate-300 hover:text-white flex items-center justify-between transition-colors"
                >
                  <span className="truncate">{r.label}</span>
                  {email === r.email && (
                    <CheckCircle2 className="w-3 h-3 text-[#E5C158] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
