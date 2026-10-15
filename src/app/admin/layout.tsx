"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  UtensilsCrossed,
  ChefHat,
  Sparkles,
  Wrench,
  Receipt,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  ShieldCheck,
  User,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;

    const token = localStorage.getItem("edesiea_staff_token");
    const userStr = localStorage.getItem("edesiea_staff_user");

    if (!token || !userStr) {
      router.push("/admin/login");
      return;
    }

    try {
      setCurrentUser(JSON.parse(userStr));
    } catch {
      router.push("/admin/login");
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("edesiea_staff_token");
    localStorage.removeItem("edesiea_staff_user");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const userRoles: string[] = currentUser?.roles || [];
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN");

  const links = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      href: "/admin/rooms",
      label: "Room Inventory & Status",
      icon: BedDouble,
      allowed:
        isSuperAdmin ||
        userRoles.includes("HOTEL_MANAGER") ||
        userRoles.includes("RECEPTIONIST"),
    },
    {
      href: "/admin/bookings",
      label: "Bookings & Walk-ins",
      icon: CalendarCheck,
      allowed:
        isSuperAdmin ||
        userRoles.includes("HOTEL_MANAGER") ||
        userRoles.includes("RECEPTIONIST"),
    },
    {
      href: "/admin/restaurant",
      label: "Restaurant & POS",
      icon: UtensilsCrossed,
      allowed:
        isSuperAdmin ||
        userRoles.includes("HOTEL_MANAGER") ||
        userRoles.includes("RESTAURANT_MANAGER"),
    },
    {
      href: "/admin/kitchen",
      label: "Kitchen KOT Display",
      icon: ChefHat,
      allowed:
        isSuperAdmin ||
        userRoles.includes("KITCHEN") ||
        userRoles.includes("RESTAURANT_MANAGER"),
    },
    {
      href: "/admin/housekeeping",
      label: "Housekeeping Board",
      icon: Sparkles,
      allowed:
        isSuperAdmin ||
        userRoles.includes("HOTEL_MANAGER") ||
        userRoles.includes("HOUSEKEEPING"),
    },
    {
      href: "/admin/maintenance",
      label: "Maintenance Tickets",
      icon: Wrench,
      allowed:
        isSuperAdmin ||
        userRoles.includes("HOTEL_MANAGER") ||
        userRoles.includes("MAINTENANCE"),
    },
    {
      href: "/admin/finance",
      label: "Finance & Daily Settlement",
      icon: Receipt,
      allowed:
        isSuperAdmin ||
        userRoles.includes("ACCOUNTANT") ||
        userRoles.includes("HOTEL_MANAGER"),
    },
    {
      href: "/admin/settings",
      label: "Hotel Configuration",
      icon: Settings,
      allowed: isSuperAdmin || userRoles.includes("HOTEL_MANAGER"),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Mobile top navigation */}
      <div className="md:hidden bg-[#0E1A2B] border-b border-[#C59B27]/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Edesiea"
            width={32}
            height={32}
            className="rounded-full bg-white p-0.5"
          />
          <span className="font-serif font-bold text-white text-sm">
            Edesiea ERP
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar (and mobile drawer) */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#0E1A2B] border-r border-[#C59B27]/30 flex flex-col justify-between p-4 transition-transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 px-2 pt-2 border-b border-white/10 pb-4">
            <div className="relative w-10 h-10 rounded-full bg-white p-1 border border-[#C59B27]">
              <Image
                src="/images/logo.png"
                alt="Edesiea Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-white">
                Hotel Edesiea
              </h2>
              <span className="text-[10px] text-[#E5C158] uppercase tracking-wider block">
                Staff Operations ERP
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {links
              .filter((l) => l.allowed)
              .map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#C59B27] text-slate-950 font-bold shadow-md"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
          </nav>
        </div>

        {/* Footer profile & logout */}
        <div className="border-t border-white/10 pt-4 px-2 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1B2B3E] border border-[#C59B27] flex items-center justify-center text-[#E5C158]">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.name || "Staff Member"}
              </p>
              <p className="text-[10px] text-[#E5C158] truncate">
                {currentUser?.roles?.join(", ") || "Staff"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <Link
              href="/"
              target="_blank"
              className="text-slate-400 hover:text-white text-[11px]"
            >
              Public Website ↗
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen bg-slate-900 p-4 sm:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
