"use client";

import React, { useState, useEffect } from "react";
import {
  Receipt,
  TrendingUp,
  CreditCard,
  AlertCircle,
  Plus,
  RefreshCw,
  Printer,
  FileText,
  DollarSign,
  CheckCircle2,
  X,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { HOTEL_INFO } from "@/lib/constants";

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<
    "payments" | "outstanding" | "invoices" | "refunds" | "expenses" | "daily_audit"
  >("payments");

  const [data, setData] = useState<any>({
    summary: {
      totalCollected: 0,
      totalRefunded: 0,
      netCollections: 0,
      totalExpenses: 0,
      totalOutstanding: 0,
    },
    payments: [],
    invoices: [],
    refunds: [],
    expenses: [],
    outstandingBookings: [],
  });

  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState("KITCHEN_GROCERY");
  const [expensePayee, setExpensePayee] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseMethod, setExpenseMethod] = useState("UPI");
  const [expenseDesc, setExpenseDesc] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Night Audit & Daily Settlement Report state
  const [dailyAuditDate, setDailyAuditDate] = useState(new Date().toISOString().split("T")[0]);
  const [dailyAuditData, setDailyAuditData] = useState<any>(null);
  const [loadingDaily, setLoadingDaily] = useState(false);

  const fetchDailyAudit = async (targetDate: string) => {
    setLoadingDaily(true);
    const token = localStorage.getItem("edesiea_staff_token");
    try {
      const res = await fetch(`/api/admin/reports/daily?date=${targetDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok) {
        setDailyAuditData(resData);
      }
    } catch (err) {
      console.error("Daily audit fetch failed:", err);
    } finally {
      setLoadingDaily(false);
    }
  };

  const fetchFinance = async () => {
    const token = localStorage.getItem("edesiea_staff_token");
    try {
      const res = await fetch("/api/admin/finance", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      }
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const handleRecordExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("edesiea_staff_token");

    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          category: expenseCategory,
          payee: expensePayee,
          amount: expenseAmount,
          paymentMethod: expenseMethod,
          description: expenseDesc,
        }),
      });

      if (res.ok) {
        setShowExpenseModal(false);
        setExpensePayee("");
        setExpenseAmount("");
        setExpenseDesc("");
        fetchFinance();
      } else {
        alert("Failed to record expense");
      }
    } catch {
      alert("Error recording expense");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#E5C158] font-bold">
            Accounting & Audit
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Finance & Daily Settlement Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Collections, room advances, GST statutory invoices, refunds, and operating expenses.
          </p>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5 text-[#E5C158]" />
            <span>Record Expense</span>
          </button>
          <button
            onClick={fetchFinance}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 shadow">
          <p className="text-xs text-slate-400 font-semibold uppercase">
            Net Collections
          </p>
          <h3 className="font-serif text-3xl font-extrabold text-[#E5C158] mt-1">
            ₹{data.summary.netCollections.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2">
            Gross: ₹{data.summary.totalCollected.toLocaleString()} • Refunds: -₹
            {data.summary.totalRefunded.toLocaleString()}
          </p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 shadow">
          <p className="text-xs text-slate-400 font-semibold uppercase">
            Outstanding Balances
          </p>
          <h3 className="font-serif text-3xl font-extrabold text-amber-400 mt-1">
            ₹{data.summary.totalOutstanding.toLocaleString()}
          </h3>
          <p className="text-[11px] text-amber-400/80 mt-2">
            {data.outstandingBookings.length} guests with balance due at check-in
          </p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 shadow">
          <p className="text-xs text-slate-400 font-semibold uppercase">
            Operating Expenses
          </p>
          <h3 className="font-serif text-3xl font-extrabold text-white mt-1">
            ₹{data.summary.totalExpenses.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2">
            {data.expenses.length} approved expense vouchers
          </p>
        </div>

        <div className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 shadow">
          <p className="text-xs text-slate-400 font-semibold uppercase">
            Invoices Settled
          </p>
          <h3 className="font-serif text-3xl font-extrabold text-emerald-400 mt-1">
            {data.invoices.length}
          </h3>
          <p className="text-[11px] text-emerald-400/80 mt-2">
            Compliant with GST 12% room / 5% dining
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: "payments", label: `Payments (${data.payments.length})` },
          {
            id: "outstanding",
            label: `Outstanding Balances (${data.outstandingBookings.length})`,
          },
          { id: "invoices", label: `GST Invoices (${data.invoices.length})` },
          { id: "refunds", label: `Refunds Ledger (${data.refunds.length})` },
          { id: "expenses", label: `Expenses (${data.expenses.length})` },
          { id: "daily_audit", label: `Daily Settlement & Night Audit 📊` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === "daily_audit" && !dailyAuditData) {
                fetchDailyAudit(dailyAuditDate);
              }
            }}
            className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#C59B27] text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Payments Ledger */}
      {activeTab === "payments" && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden shadow">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Gateway Reference</th>
                <th className="py-3 px-4">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {data.payments.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-750">
                  <td className="py-3 px-4">
                    {new Date(p.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {p.booking?.bookingRef}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {p.booking?.guest?.fullName}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-serif text-sm font-bold text-[#E5C158]">
                    ₹{p.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                    {p.gatewayPaymentId || "Direct Reception Settle"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Reconciled
                    </span>
                  </td>
                </tr>
              ))}
              {data.payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No payment records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Outstanding Balances */}
      {activeTab === "outstanding" && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden shadow">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Check-in</th>
                <th className="py-3 px-4">Total Bill</th>
                <th className="py-3 px-4">Advance Paid</th>
                <th className="py-3 px-4">Remaining Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {data.outstandingBookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-slate-750">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {b.bookingRef}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {b.guest?.fullName}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{b.guest?.phone}</td>
                  <td className="py-3 px-4">{b.checkInDate}</td>
                  <td className="py-3 px-4 font-bold">
                    ₹{b.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-emerald-400">
                    ₹{b.advancePaid.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-serif text-sm font-bold text-amber-400">
                    ₹{b.balanceDue.toLocaleString()}
                  </td>
                </tr>
              ))}
              {data.outstandingBookings.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    All guest folios are fully settled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: GST Invoices */}
      {activeTab === "invoices" && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden shadow">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date Issued</th>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">GST (12%)</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {data.invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-750">
                  <td className="py-3 px-4 font-mono font-bold text-[#E5C158]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(inv.issuedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {inv.guest?.fullName}
                  </td>
                  <td className="py-3 px-4">₹{inv.subTotal.toLocaleString()}</td>
                  <td className="py-3 px-4 text-slate-400">
                    ₹{inv.taxAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-serif text-sm font-bold text-white">
                    ₹{inv.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-[#E5C158] rounded text-[11px] font-semibold border border-slate-700 flex items-center gap-1 ml-auto"
                    >
                      <Printer className="w-3 h-3" />
                      <span>View Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
              {data.invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Invoices are generated automatically on guest checkout.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Refunds Ledger */}
      {activeTab === "refunds" && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden shadow">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Guest</th>
                <th className="py-3 px-4">Refund Amount</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Processed By</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {data.refunds.map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-750">
                  <td className="py-3 px-4">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {r.booking?.bookingRef}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {r.booking?.guest?.fullName}
                  </td>
                  <td className="py-3 px-4 font-serif text-sm font-bold text-red-400">
                    -₹{r.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{r.reason}</td>
                  <td className="py-3 px-4 text-slate-300">{r.processedBy}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.refunds.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No refunds recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Operating Expenses */}
      {activeTab === "expenses" && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden shadow">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payee / Supplier</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {data.expenses.map((e: any) => (
                <tr key={e.id} className="hover:bg-slate-750">
                  <td className="py-3 px-4">{e.date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-200">
                    {e.category.replace("_", " ")}
                  </td>
                  <td className="py-3 px-4 text-white font-bold">{e.payee}</td>
                  <td className="py-3 px-4 text-slate-400">{e.description}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-700">
                      {e.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-serif text-sm font-bold text-white">
                    ₹{e.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-emerald-400">{e.approvedBy}</td>
                </tr>
              ))}
              {data.expenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No expenses recorded yet. Use &apos;Record Expense&apos; to log supplier purchases.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: Night Audit & Daily Settlement Report */}
      {activeTab === "daily_audit" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300">Settlement Date:</span>
              <input
                type="date"
                value={dailyAuditDate}
                onChange={(e) => {
                  setDailyAuditDate(e.target.value);
                  fetchDailyAudit(e.target.value);
                }}
                className="bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs font-mono focus:border-[#C59B27] focus:outline-none"
              />
              <button
                onClick={() => fetchDailyAudit(dailyAuditDate)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDaily ? "animate-spin text-[#E5C158]" : ""}`} />
                <span>Run Audit</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-[#C59B27] hover:bg-[#b0881f] text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Settlement Sheet</span>
              </button>
            </div>
          </div>

          {loadingDaily ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#E5C158] mb-2" />
              <p className="text-xs font-medium">Reconciling room folios, restaurant KOTs, and statutory taxes...</p>
            </div>
          ) : dailyAuditData ? (
            <div className="space-y-6">
              {/* Daily KPI Tiles */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-[#C59B27]/40 p-4 rounded-xl shadow">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Gross Collections
                  </span>
                  <p className="font-serif text-2xl font-bold text-[#E5C158] mt-1">
                    ₹{dailyAuditData.kpis.grossRevenue.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Rooms: ₹{dailyAuditData.kpis.roomCollections.toLocaleString()} • POS: ₹{dailyAuditData.kpis.restaurantGross.toLocaleString()}
                  </p>
                </div>

                <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-xl shadow">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Net EBITDA Margin
                  </span>
                  <p className="font-serif text-2xl font-bold text-emerald-400 mt-1">
                    ₹{dailyAuditData.kpis.netOperatingProfit.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-emerald-400/80 mt-1">
                    Revenue minus Expenses
                  </p>
                </div>

                <div className="bg-slate-900 border border-blue-500/30 p-4 rounded-xl shadow">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Occupancy & Rooms
                  </span>
                  <p className="font-serif text-2xl font-bold text-white mt-1">
                    {dailyAuditData.kpis.occupancyRate}%
                  </p>
                  <p className="text-[10px] text-blue-400 mt-1">
                    {dailyAuditData.kpis.occupiedRoomCount} / {dailyAuditData.kpis.totalRooms} Physical Rooms
                  </p>
                </div>

                <div className="bg-slate-900 border border-purple-500/30 p-4 rounded-xl shadow">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    ADR & RevPAR
                  </span>
                  <p className="font-serif text-2xl font-bold text-purple-300 mt-1">
                    ₹{dailyAuditData.kpis.adr.toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-purple-400/80 mt-1">
                    RevPAR: ₹{dailyAuditData.kpis.revPar.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Tax & Reconciliation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GST Tax Compliance Card */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-serif font-bold text-base text-white">
                      Statutory GST Tax Summary
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                      Audit Verified
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Room Stays GST (12%)</span>
                      <span className="font-mono font-bold text-white">
                        ₹{dailyAuditData.taxes.roomStayGst12.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Restaurant CGST (2.5%)</span>
                      <span className="font-mono font-bold text-white">
                        ₹{dailyAuditData.taxes.restaurantCgst2_5.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Restaurant SGST (2.5%)</span>
                      <span className="font-mono font-bold text-white">
                        ₹{dailyAuditData.taxes.restaurantSgst2_5.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 text-sm font-bold text-[#E5C158] border-t border-slate-700">
                      <span>Total Government Tax Liability</span>
                      <span className="font-mono">
                        ₹{dailyAuditData.taxes.totalTaxLiability.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Channels Card */}
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 shadow">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="font-serif font-bold text-base text-white">
                      Payment Channel Collections
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-500/40">
                      {dailyAuditData.paymentsCount} Payments
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>UPI (GPay / PhonePe / Paytm)</span>
                      <span className="font-mono font-bold text-white">
                        ₹{(dailyAuditData.paymentMethods.UPI || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Razorpay Online Gateway</span>
                      <span className="font-mono font-bold text-white">
                        ₹{(dailyAuditData.paymentMethods.RAZORPAY || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Cash at Reception / POS</span>
                      <span className="font-mono font-bold text-white">
                        ₹{(dailyAuditData.paymentMethods.CASH || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span>Card / NetBanking</span>
                      <span className="font-mono font-bold text-white">
                        ₹{(dailyAuditData.paymentMethods.CARD || 0).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 text-sm font-bold text-[#E5C158] border-t border-slate-700">
                      <span>Total Collections Reconciled</span>
                      <span className="font-mono">
                        ₹{dailyAuditData.kpis.roomCollections.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Operating Expenses Breakdown on Target Date */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <h3 className="font-serif font-bold text-base text-white">
                    Daily Operating Outflows ({dailyAuditData.expensesCount} Vouchers)
                  </h3>
                  <span className="text-xs font-mono font-bold text-amber-400">
                    Total: ₹{dailyAuditData.kpis.totalExpenses.toLocaleString("en-IN")}
                  </span>
                </div>

                {dailyAuditData.expenses.length === 0 ? (
                  <p className="text-xs text-slate-500 py-3">No expenses recorded on {dailyAuditDate}.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(dailyAuditData.expensesByCategory).map(([cat, amt]: any) => (
                      <div key={cat} className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                        <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                          {cat.replace("_", " ")}
                        </span>
                        <span className="text-base font-serif font-bold text-white block mt-0.5">
                          ₹{amt.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select a date and click &apos;Run Audit&apos; to view the night settlement breakdown.
            </div>
          )}
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowExpenseModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-white">
              Record Operating Expense
            </h3>

            <form onSubmit={handleRecordExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Category *
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                >
                  <option value="KITCHEN_GROCERY">
                    Kitchen Groceries & Vegetables
                  </option>
                  <option value="DAIRY_PANEER">Dairy & Fresh Paneer</option>
                  <option value="LINEN_LAUNDRY">Linen & Laundry Supplies</option>
                  <option value="MAINTENANCE_PARTS">
                    Maintenance & Electrical
                  </option>
                  <option value="HOUSEKEEPING_CHEMICALS">
                    Housekeeping Supplies
                  </option>
                  <option value="UTILITIES_ELECTRICITY">
                    Electricity & Fuel
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Payee / Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pali Local Dairy / Shivam Vegetables"
                  value={expensePayee}
                  onChange={(e) => setExpensePayee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="2500"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Payment Method
                  </label>
                  <select
                    value={expenseMethod}
                    onChange={(e) => setExpenseMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="UPI">UPI / GPay</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Description / Items Purchased
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 10 kg Malai Paneer + 5L Desi Ghee for weekend thalis"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C59B27] text-slate-950 font-bold rounded-lg shadow"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Printable Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b pb-4 space-y-1">
              <h2 className="font-serif text-2xl font-bold tracking-wide">
                HOTEL EDESIEA
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {HOTEL_INFO.legalName}
              </p>
              <p className="text-[11px] text-slate-500">{HOTEL_INFO.address}</p>
              <p className="text-[11px] text-slate-500">
                Phone: {HOTEL_INFO.phone} • GSTIN: 27XXXXXXXXXXZX
              </p>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <div>
                <p className="font-bold text-slate-900">
                  Bill To: {selectedInvoice.guest?.fullName}
                </p>
                <p>Phone: {selectedInvoice.guest?.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-slate-900">
                  {selectedInvoice.invoiceNumber}
                </p>
                <p>Date: {new Date(selectedInvoice.issuedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden text-xs">
              <div className="bg-slate-100 p-2.5 font-bold flex justify-between border-b">
                <span>Description</span>
                <span>Amount (INR)</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span>Room Stay Charges</span>
                  <span>₹{selectedInvoice.subTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Statutory Hotel GST (12%)</span>
                  <span>₹{selectedInvoice.taxAmount.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-sm text-slate-900">
                  <span>Grand Total</span>
                  <span>₹{selectedInvoice.grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                  <span>Payment Status</span>
                  <span>Settled in Full (PAID) ✓</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0E1A2B] text-[#E5C158] font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Tax Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
