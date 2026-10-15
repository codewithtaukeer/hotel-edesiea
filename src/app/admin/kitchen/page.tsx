"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Flame,
  Volume2,
  VolumeX,
  RefreshCw,
  Utensils,
  MapPin,
  Check,
} from "lucide-react";

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  specialInstructions?: string | null;
}

interface RestaurantOrder {
  id: string;
  orderNumber: string;
  orderType: string;
  status: string;
  subTotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  stewardName?: string | null;
  createdAt: string;
  table?: { tableNumber: string; floor: string } | null;
  booking?: {
    bookingRef: string;
    guest: { fullName: string; phone: string };
  } | null;
  items: OrderItem[];
}

export default function KitchenKOTPage() {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ACTIVE" | "PENDING" | "KITCHEN_PREPARING" | "READY" | "SERVED">("ACTIVE");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const lastOrderCountRef = useRef(0);

  // Play audio chime for new incoming KOT
  const playAlertChime = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn("Audio chime failed", e);
    }
  };

  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.orders) {
        // Detect newly arrived pending orders
        const pendingCount = data.orders.filter((o: any) => o.status === "PENDING").length;
        if (pendingCount > lastOrderCountRef.current && lastOrderCountRef.current > 0) {
          playAlertChime();
        }
        lastOrderCountRef.current = pendingCount;
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch KOT orders:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 8000); // 8-second auto-poll
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem("edesiea_staff_token");
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update order status");
        return;
      }

      await fetchOrders(true);
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleItemCheck = (itemId: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const getElapsedTime = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  };

  const getUrgencyColor = (createdAt: string, status: string) => {
    if (status === "READY" || status === "SERVED" || status === "PAID") {
      return "border-emerald-600/40 bg-emerald-950/20";
    }
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins > 20) return "border-red-500 bg-red-950/30";
    if (diffMins > 10) return "border-amber-500 bg-amber-950/30";
    return "border-slate-700 bg-slate-800/80";
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === "ACTIVE") {
      return ["PENDING", "KITCHEN_PREPARING", "READY"].includes(o.status);
    }
    return o.status === filter;
  });

  const pendingCount = orders.filter((o) => o.status === "PENDING").length;
  const preparingCount = orders.filter((o) => o.status === "KITCHEN_PREPARING").length;
  const readyCount = orders.filter((o) => o.status === "READY").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-[#E5C158]" />
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Kitchen Display System (KDS / KOT)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time kitchen order tickets for Hotel Edesiea pure-veg kitchen & restaurant.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              soundEnabled
                ? "bg-emerald-900/40 border-emerald-500 text-emerald-300"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
            title="Toggle audible chime when new KOT arrives"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Chime On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Chime Off</span>
              </>
            )}
          </button>

          <button
            onClick={() => fetchOrders()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#E5C158]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Counters & Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filter === "ACTIVE"
                ? "bg-[#C59B27] text-slate-950 shadow"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <span>Active KOTs</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-900/40 text-current font-mono">
              {pendingCount + preparingCount + readyCount}
            </span>
          </button>

          <button
            onClick={() => setFilter("PENDING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filter === "PENDING"
                ? "bg-amber-500 text-slate-950 shadow"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>New Tickets</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-red-600 text-white font-mono animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setFilter("KITCHEN_PREPARING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filter === "KITCHEN_PREPARING"
                ? "bg-blue-600 text-white shadow"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>On Stove / Cooking</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-900/40 text-current font-mono">
              {preparingCount}
            </span>
          </button>

          <button
            onClick={() => setFilter("READY")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filter === "READY"
                ? "bg-emerald-600 text-white shadow"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready for Pickup</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-slate-900/40 text-current font-mono">
              {readyCount}
            </span>
          </button>

          <button
            onClick={() => setFilter("SERVED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === "SERVED"
                ? "bg-slate-600 text-white shadow"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <span>History / Served</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Kitchen Feed (Auto-syncs every 8s)</span>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-12 text-center">
          <ChefHat className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-slate-300">
            No Orders in this Status
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Kitchen queue is clear. New incoming orders from the restaurant POS or room service will appear automatically here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const isPending = order.status === "PENDING";
            const isCooking = order.status === "KITCHEN_PREPARING";
            const isReady = order.status === "READY";
            const isServed = order.status === "SERVED";
            const cardUrgencyClass = getUrgencyColor(order.createdAt, order.status);

            return (
              <div
                key={order.id}
                className={`rounded-xl border shadow-lg flex flex-col justify-between overflow-hidden transition-all ${cardUrgencyClass}`}
              >
                {/* Ticket Header */}
                <div className="p-3 bg-slate-900/70 border-b border-slate-700/50 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#E5C158]">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          order.orderType === "ROOM_SERVICE"
                            ? "bg-purple-900/60 text-purple-300 border border-purple-500/30"
                            : order.orderType === "TAKEAWAY"
                            ? "bg-blue-900/60 text-blue-300 border border-blue-500/30"
                            : "bg-emerald-900/60 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {order.orderType === "ROOM_SERVICE"
                          ? "Room Service"
                          : order.orderType === "TAKEAWAY"
                          ? "Parcel"
                          : "Dine-In"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-bold text-slate-200">
                        {order.table?.tableNumber
                          ? `Table ${order.table.tableNumber} (${order.table.floor || "Rooftop"})`
                          : order.booking
                          ? `Room Ref ${order.booking.bookingRef}`
                          : "Counter / Parcel"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{getElapsedTime(order.createdAt)}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Steward: {order.stewardName || "Staff"}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-3.5 space-y-2.5 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 flex justify-between">
                    <span>Dish</span>
                    <span>Qty</span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => {
                      const isItemDone = !!checkedItems[item.id];
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItemCheck(item.id)}
                          className={`p-2 rounded-lg cursor-pointer transition select-none flex items-start justify-between gap-2 ${
                            isItemDone
                              ? "bg-emerald-950/40 border border-emerald-800/40 line-through opacity-70"
                              : "bg-slate-900/60 border border-slate-700/40 hover:border-slate-600"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                                isItemDone
                                  ? "bg-emerald-600 border-emerald-500 text-white"
                                  : "border-slate-500 bg-slate-800"
                              }`}
                            >
                              {isItemDone && <Check className="w-3 h-3" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-100">
                                {item.itemName}
                              </p>
                              {item.specialInstructions && (
                                <p className="text-[11px] text-[#E5C158] font-medium mt-0.5 italic">
                                  Note: {item.specialInstructions}
                                </p>
                              )}
                            </div>
                          </div>

                          <span className="font-mono font-extrabold text-sm text-[#E5C158] px-2 py-0.5 rounded bg-slate-800">
                            x{item.quantity}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Progression Action Bar */}
                <div className="p-3 bg-slate-900/90 border-t border-slate-700/60 flex items-center gap-2">
                  {isPending && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "KITCHEN_PREPARING")}
                      disabled={updatingId === order.id}
                      className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition disabled:opacity-50"
                    >
                      <Flame className="w-4 h-4" />
                      <span>{updatingId === order.id ? "Updating..." : "Start Cooking (Accept)"}</span>
                    </button>
                  )}

                  {isCooking && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "READY")}
                      disabled={updatingId === order.id}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{updatingId === order.id ? "Updating..." : "Mark Ready (Call Steward)"}</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "SERVED")}
                      disabled={updatingId === order.id}
                      className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition disabled:opacity-50"
                    >
                      <Utensils className="w-4 h-4" />
                      <span>{updatingId === order.id ? "Updating..." : "Dispatch / Served"}</span>
                    </button>
                  )}

                  {isServed && (
                    <div className="w-full py-1.5 px-3 rounded-lg bg-slate-800 text-center text-xs text-slate-400 font-semibold">
                      Served to Guest / Bill at POS
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
