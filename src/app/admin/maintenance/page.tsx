"use client";

import React, { useState, useEffect } from "react";
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ShieldAlert,
  Coins,
  Filter,
  RefreshCw,
  Building2,
  Check,
  User,
} from "lucide-react";

interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  roomId?: string | null;
  title: string;
  description: string;
  priority: string;
  status: string;
  blocksRoom: boolean;
  assignedTo?: string | null;
  cost?: number | null;
  resolvedAt?: string | null;
  createdAt: string;
  room?: {
    id: string;
    roomNumber: string;
    floor: number;
    operationalStatus: string;
    category: { name: string };
  } | null;
}

interface PhysicalRoom {
  id: string;
  roomNumber: string;
  floor: number;
  operationalStatus: string;
  housekeepingStatus: string;
  categoryId: string;
}

export default function MaintenancePage() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [rooms, setRooms] = useState<PhysicalRoom[]>([]);
  const [stats, setStats] = useState({
    openTickets: 0,
    urgentTickets: 0,
    blockedRooms: 0,
    totalRepairCost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Create Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    roomId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    blocksRoom: false,
    assignedTo: "In-House Maintenance",
    cost: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Resolve Modal state
  const [resolvingTicket, setResolvingTicket] = useState<MaintenanceTicket | null>(null);
  const [resolveCost, setResolveCost] = useState("");
  const [resolveNotes, setResolveNotes] = useState("");
  const [resolving, setResolving] = useState(false);

  const fetchMaintenanceData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/maintenance");
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
        setRooms(data.rooms || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch maintenance tickets:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("edesiea_staff_token");
      const res = await fetch("/api/admin/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify(newTicket),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create maintenance ticket");
        return;
      }

      setShowCreateModal(false);
      setNewTicket({
        roomId: "",
        title: "",
        description: "",
        priority: "MEDIUM",
        blocksRoom: false,
        assignedTo: "In-House Maintenance",
        cost: "",
      });
      await fetchMaintenanceData(true);
    } catch (err) {
      console.error(err);
      alert("Error creating ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      const token = localStorage.getItem("edesiea_staff_token");
      const res = await fetch("/api/admin/maintenance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ ticketId, status }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update ticket status");
        return;
      }

      await fetchMaintenanceData(true);
    } catch (err) {
      console.error(err);
      alert("Error updating ticket status");
    }
  };

  const handleResolveTicket = async () => {
    if (!resolvingTicket) return;
    setResolving(true);
    try {
      const token = localStorage.getItem("edesiea_staff_token");
      const res = await fetch("/api/admin/maintenance", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          ticketId: resolvingTicket.id,
          status: "RESOLVED",
          cost: resolveCost ? parseFloat(resolveCost) : resolvingTicket.cost || 0,
          resolutionNotes: resolveNotes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to resolve ticket");
        return;
      }

      setResolvingTicket(null);
      setResolveCost("");
      setResolveNotes("");
      await fetchMaintenanceData(true);
    } catch (err) {
      console.error(err);
      alert("Error resolving ticket");
    } finally {
      setResolving(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
    if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-7 h-7 text-[#E5C158]" />
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Maintenance & Physical Asset Tickets
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Log hotel repairs, track technician resolution, record costs, and manage room inventory blocking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchMaintenanceData()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#E5C158]" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#C59B27] hover:bg-[#b0881f] text-slate-950 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Tickets</span>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-serif text-white mt-2">{stats.openTickets}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending technician action</p>
        </div>

        <div className="bg-slate-900 border border-red-500/30 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Urgent Issues</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-serif text-white mt-2">{stats.urgentTickets}</p>
          <p className="text-[11px] text-red-400/80 mt-0.5">High priority repairs</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Rooms Blocked</span>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-serif text-white mt-2">{stats.blockedRooms}</p>
          <p className="text-[11px] text-amber-400/80 mt-0.5">Removed from availability</p>
        </div>

        <div className="bg-slate-900 border border-[#C59B27]/30 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-[#E5C158]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Repair Cost</span>
            <Coins className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-serif text-white mt-2">
            ₹{stats.totalRepairCost.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-[#E5C158]/80 mt-0.5">Logged in expense ledger</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap gap-2">
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? "bg-[#C59B27] text-slate-950 shadow"
                  : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              {st === "ALL"
                ? "All Tickets"
                : st === "OPEN"
                ? "Open / Pending"
                : st === "IN_PROGRESS"
                ? "In Progress"
                : "Resolved"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#C59B27]"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent (Emergency)</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-12 text-center">
          <Wrench className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-serif font-bold text-slate-300">
            No Maintenance Tickets Found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            All hotel systems, plumbing, electricals, and physical rooms are operating normally.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const isOpen = ticket.status === "OPEN";
            const isInProgress = ticket.status === "IN_PROGRESS";
            const isResolved = ticket.status === "RESOLVED";

            return (
              <div
                key={ticket.id}
                className={`bg-slate-900 border rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  ticket.blocksRoom && !isResolved
                    ? "border-red-500/50 bg-red-950/10"
                    : ticket.priority === "URGENT" && !isResolved
                    ? "border-amber-500/50 bg-amber-950/10"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#E5C158]">
                      {ticket.ticketNumber}
                    </span>

                    {/* Room tag */}
                    {ticket.room ? (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-slate-800 text-slate-200 border border-slate-700">
                        Room {ticket.room.roomNumber} ({ticket.room.category.name})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-800 text-slate-400">
                        General Property / Common Area
                      </span>
                    )}

                    {/* Priority Badge */}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        ticket.priority === "URGENT"
                          ? "bg-red-900 text-red-300 border border-red-500/40 animate-pulse"
                          : ticket.priority === "HIGH"
                          ? "bg-amber-900 text-amber-300 border border-amber-500/40"
                          : ticket.priority === "MEDIUM"
                          ? "bg-blue-900 text-blue-300 border border-blue-500/40"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {ticket.priority}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        isResolved
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-500/40"
                          : isInProgress
                          ? "bg-blue-950 text-blue-300 border border-blue-500/40"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {ticket.status}
                    </span>

                    {/* Blocks Room Badge */}
                    {ticket.blocksRoom && !isResolved && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-950 text-red-300 border border-red-500/50 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Room Inventory Blocked</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif font-bold text-base text-white">
                    {ticket.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {ticket.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Assigned: {ticket.assignedTo || "Unassigned"}
                    </span>
                    {ticket.cost !== null && ticket.cost !== undefined && ticket.cost > 0 && (
                      <span className="text-[#E5C158] font-bold">
                        Cost: ₹{ticket.cost.toLocaleString("en-IN")}
                      </span>
                    )}
                    <span>
                      Created: {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {ticket.resolvedAt && (
                      <span className="text-emerald-400">
                        Resolved: {new Date(ticket.resolvedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  {isOpen && (
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, "IN_PROGRESS")}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Start Work</span>
                    </button>
                  )}

                  {!isResolved && (
                    <button
                      onClick={() => {
                        setResolvingTicket(ticket);
                        setResolveCost(ticket.cost ? ticket.cost.toString() : "");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}

                  {isResolved && (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold px-2 py-1 bg-emerald-950/40 rounded border border-emerald-500/30">
                      <Check className="w-4 h-4" />
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-[#C59B27]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Wrench className="w-6 h-6 text-[#E5C158]" />
                <h2 className="text-lg font-serif font-bold text-white">
                  Log New Maintenance Ticket
                </h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Affected Room or Location
                </label>
                <select
                  value={newTicket.roomId}
                  onChange={(e) => setNewTicket({ ...newTicket, roomId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-[#C59B27] focus:outline-none"
                >
                  <option value="">General Property / Restaurant / Lobby</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.roomNumber} (Floor {r.floor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Issue Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="e.g. Bathroom hot geyser not heating, AC water leakage"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Describe technical observations, required parts, technician notes..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-[#C59B27] focus:outline-none"
                  >
                    <option value="LOW">Low (Minor cosmetic)</option>
                    <option value="MEDIUM">Medium (Standard repair)</option>
                    <option value="HIGH">High (Guest impacting)</option>
                    <option value="URGENT">Urgent (Immediate emergency)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newTicket.cost}
                    onChange={(e) => setNewTicket({ ...newTicket, cost: e.target.value })}
                    placeholder="e.g. 1200"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-[#C59B27] focus:outline-none"
                  />
                </div>
              </div>

              {/* Room Inventory Blocking Checkbox */}
              {newTicket.roomId && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newTicket.blocksRoom}
                      onChange={(e) => setNewTicket({ ...newTicket, blocksRoom: e.target.checked })}
                      className="mt-0.5 rounded text-[#C59B27] focus:ring-0"
                    />
                    <div>
                      <span className="font-bold text-red-300 block">
                        Block this room from booking inventory
                      </span>
                      <span className="text-[11px] text-red-200/70 block mt-0.5">
                        Will mark room as MAINTENANCE_BLOCKED so no online guests or walk-ins can book it until repairs are signed off.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Assigned Technician / Lead
                </label>
                <input
                  type="text"
                  value={newTicket.assignedTo}
                  onChange={(e) => setNewTicket({ ...newTicket, assignedTo: e.target.value })}
                  placeholder="Technician or Vendor name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#C59B27] hover:bg-[#b0881f] text-slate-950 font-bold shadow"
                >
                  {submitting ? "Creating..." : "Create Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Ticket Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                <h2 className="text-lg font-serif font-bold text-white">
                  Resolve Ticket {resolvingTicket.ticketNumber}
                </h2>
              </div>
              <button
                onClick={() => setResolvingTicket(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Resolving &quot;{resolvingTicket.title}&quot;.
              {resolvingTicket.blocksRoom && (
                <span className="block mt-1 text-emerald-400 font-semibold">
                  ✓ This room will automatically be unblocked and flagged for housekeeping sanitization!
                </span>
              )}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Final Incurred Repair Cost (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={resolveCost}
                  onChange={(e) => setResolveCost(e.target.value)}
                  placeholder="e.g. 750 (0 if no parts purchased)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Logged automatically into Hotel Edesiea operating expense ledger.
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Resolution Notes
                </label>
                <textarea
                  rows={2}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="e.g. Replaced geyser thermostat coil, tested water output hot"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setResolvingTicket(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveTicket}
                disabled={resolving}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{resolving ? "Resolving..." : "Confirm & Sign Off"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
