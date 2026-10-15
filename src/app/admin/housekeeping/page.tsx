"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  RefreshCw,
  UserCheck,
  CheckSquare,
  Square,
  BedDouble,
  ShieldAlert,
  ArrowRight,
  ListTodo,
} from "lucide-react";

interface RoomCategory {
  id: string;
  name: string;
  basePrice: number;
}

interface HousekeepingTask {
  id: string;
  roomId: string;
  assignedTo?: string | null;
  status: string;
  taskType: string;
  checklistPassed: boolean;
  notes?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}

interface PhysicalRoom {
  id: string;
  roomNumber: string;
  floor: number;
  operationalStatus: string;
  housekeepingStatus: string;
  category: RoomCategory;
  housekeepingTasks: HousekeepingTask[];
  maintenanceTickets: any[];
}

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<PhysicalRoom[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [floorFilter, setFloorFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Inspection Checklist Modal state
  const [selectedRoom, setSelectedRoom] = useState<PhysicalRoom | null>(null);
  const [checklist, setChecklist] = useState({
    linen: true,
    bathroom: true,
    acRemote: true,
    floorsMopped: true,
    trashEmptied: true,
    waterKettle: true,
  });
  const [assignedStaff, setAssignedStaff] = useState<string>("");
  const [inspectionNotes, setInspectionNotes] = useState<string>("");
  const [savingInspection, setSavingInspection] = useState(false);

  const fetchHousekeepingData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch("/api/admin/housekeeping");
      const data = await res.json();
      if (data.rooms) {
        setRooms(data.rooms);
        setStaff(data.staff || []);
      }
    } catch (err) {
      console.error("Failed to fetch housekeeping data:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHousekeepingData();
    const interval = setInterval(() => {
      fetchHousekeepingData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickStatusChange = async (roomId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("edesiea_staff_token");
      const res = await fetch("/api/admin/housekeeping", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          roomId,
          directRoomStatus: newStatus,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update room housekeeping status");
        return;
      }

      await fetchHousekeepingData(true);
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  const openInspectionModal = (room: PhysicalRoom) => {
    setSelectedRoom(room);
    setChecklist({
      linen: true,
      bathroom: true,
      acRemote: true,
      floorsMopped: true,
      trashEmptied: true,
      waterKettle: true,
    });
    setAssignedStaff(staff[0]?.name || "Housekeeping Lead");
    setInspectionNotes("");
  };

  const submitInspection = async () => {
    if (!selectedRoom) return;
    setSavingInspection(true);
    try {
      const token = localStorage.getItem("edesiea_staff_token");
      const allPassed = Object.values(checklist).every(Boolean);

      // 1. Create completed task record
      const res = await fetch("/api/admin/housekeeping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          assignedTo: assignedStaff,
          taskType: "DEPARTURE_CLEAN",
          notes: inspectionNotes || "Passed 6-point Edesiea departure inspection",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to record task");
        return;
      }

      const postData = await res.json();

      // 2. Mark task inspected and room clean
      if (allPassed && postData.task?.id) {
        await fetch("/api/admin/housekeeping", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`,
          },
          body: JSON.stringify({
            taskId: postData.task.id,
            status: "INSPECTED",
            checklistPassed: true,
            notes: inspectionNotes,
          }),
        });
      }

      setSelectedRoom(null);
      await fetchHousekeepingData(true);
    } catch (err) {
      console.error(err);
      alert("Error saving inspection");
    } finally {
      setSavingInspection(false);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (floorFilter !== "ALL" && r.floor.toString() !== floorFilter) return false;
    if (statusFilter !== "ALL" && r.housekeepingStatus !== statusFilter) return false;
    return true;
  });

  const cleanCount = rooms.filter((r) => r.housekeepingStatus === "CLEAN").length;
  const dirtyCount = rooms.filter((r) => r.housekeepingStatus === "DIRTY").length;
  const inspectingCount = rooms.filter((r) => r.housekeepingStatus === "INSPECTING").length;
  const maintenanceCount = rooms.filter((r) => r.housekeepingStatus === "MAINTENANCE").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-[#E5C158]" />
            <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
              Housekeeping Board & Room Readiness
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time room sanitization, inspection checklists, and housekeeping task assignment for 12 rooms.
          </p>
        </div>

        <button
          onClick={() => fetchHousekeepingData()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#E5C158]" : ""}`} />
          <span>Refresh Board</span>
        </button>
      </div>

      {/* KPI Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Clean & Inspected</span>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-serif text-white mt-2">{cleanCount} / 12</p>
          <p className="text-[11px] text-emerald-400/80 mt-0.5">Ready for guest check-in</p>
        </div>

        <div className="bg-slate-900 border border-red-500/30 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-red-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Dirty / Needs Clean</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-serif text-white mt-2">{dirtyCount}</p>
          <p className="text-[11px] text-red-400/80 mt-0.5">Vacated or scheduled clean</p>
        </div>

        <div className="bg-slate-900 border border-blue-500/30 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress / Inspecting</span>
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-serif text-white mt-2">{inspectingCount}</p>
          <p className="text-[11px] text-blue-400/80 mt-0.5">Staff currently in room</p>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Under Maintenance</span>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold font-serif text-white mt-2">{maintenanceCount}</p>
          <p className="text-[11px] text-amber-400/80 mt-0.5">Blocked from guest stay</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
        <div className="flex flex-wrap gap-2">
          {["ALL", "DIRTY", "INSPECTING", "CLEAN", "MAINTENANCE"].map((st) => (
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
                ? "All Statuses"
                : st === "DIRTY"
                ? "Dirty / To Clean"
                : st === "INSPECTING"
                ? "In Progress"
                : st === "CLEAN"
                ? "Clean & Ready"
                : "Maintenance"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Floor:</span>
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-[#C59B27]"
          >
            <option value="ALL">All Floors</option>
            <option value="1">1st Floor (Deluxe)</option>
            <option value="2">2nd Floor (Honeymoon)</option>
            <option value="3">3rd Floor (Super Deluxe)</option>
            <option value="4">4th Floor (Suite Room)</option>
          </select>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const isClean = room.housekeepingStatus === "CLEAN";
          const isDirty = room.housekeepingStatus === "DIRTY";
          const isInspecting = room.housekeepingStatus === "INSPECTING";
          const isMaint = room.housekeepingStatus === "MAINTENANCE";
          const isBlocked = room.operationalStatus === "MAINTENANCE_BLOCKED";

          return (
            <div
              key={room.id}
              className={`rounded-xl border p-4 flex flex-col justify-between shadow-lg transition-all ${
                isBlocked
                  ? "bg-slate-900/90 border-red-500/50"
                  : isDirty
                  ? "bg-slate-900 border-red-500/40"
                  : isInspecting
                  ? "bg-slate-900 border-blue-500/40"
                  : isMaint
                  ? "bg-slate-900 border-amber-500/40"
                  : "bg-slate-900 border-emerald-500/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-serif font-bold text-white text-base">
                      {room.roomNumber}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-white">
                        Room {room.roomNumber}
                      </h3>
                      <p className="text-[11px] text-[#E5C158]">
                        {room.category.name} (Floor {room.floor})
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                      isClean
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
                        : isDirty
                        ? "bg-red-950 text-red-300 border-red-500/40"
                        : isInspecting
                        ? "bg-blue-950 text-blue-300 border-blue-500/40"
                        : "bg-amber-950 text-amber-300 border-amber-500/40"
                    }`}
                  >
                    {isClean
                      ? "CLEAN"
                      : isDirty
                      ? "DIRTY"
                      : isInspecting
                      ? "IN PROGRESS"
                      : "MAINTENANCE"}
                  </span>
                </div>

                <div className="py-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Inventory Status:</span>
                    <span
                      className={`font-semibold ${
                        isBlocked ? "text-red-400 font-bold" : "text-emerald-400"
                      }`}
                    >
                      {isBlocked ? "MAINTENANCE BLOCKED" : "BOOKABLE"}
                    </span>
                  </div>

                  {room.housekeepingTasks[0] && (
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Last Clean:</span>
                      <span>
                        {new Date(room.housekeepingTasks[0].createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  )}

                  {room.maintenanceTickets.length > 0 && (
                    <div className="p-1.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[10px] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{room.maintenanceTickets.length} Active Maintenance Issue(s)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                {isDirty && (
                  <button
                    onClick={() => handleQuickStatusChange(room.id, "INSPECTING")}
                    className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Start Cleaning Task</span>
                  </button>
                )}

                {isInspecting && (
                  <button
                    onClick={() => openInspectionModal(room)}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Perform 6-Pt Inspection</span>
                  </button>
                )}

                {isClean && (
                  <button
                    onClick={() => handleQuickStatusChange(room.id, "DIRTY")}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1 border border-slate-700"
                  >
                    <span>Mark as Dirty / Vacated</span>
                  </button>
                )}

                {isMaint && (
                  <div className="w-full py-1.5 px-3 rounded-lg bg-amber-950/60 text-amber-400 text-center text-[11px] font-semibold border border-amber-500/30">
                    Handled via Maintenance Tab
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6-Point Inspection Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-[#C59B27]/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#E5C158]" />
                <h2 className="text-lg font-serif font-bold text-white">
                  Room {selectedRoom.roomNumber} Inspection & Sign-off
                </h2>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Verify all 6 hotel sanitization standards for Hotel Edesiea before releasing this room for guest check-in:
            </p>

            <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200">
              <label
                className="flex items-center gap-2.5 cursor-pointer select-none"
                onClick={() => setChecklist((c) => ({ ...c, linen: !c.linen }))}
              >
                {checklist.linen ? (
                  <CheckSquare className="w-4 h-4 text-[#E5C158]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>1. Fresh bed linens changed & Edesiea towels placed</span>
              </label>

              <label
                className="flex items-center gap-2.5 cursor-pointer select-none"
                onClick={() => setChecklist((c) => ({ ...c, bathroom: !c.bathroom }))}
              >
                {checklist.bathroom ? (
                  <CheckSquare className="w-4 h-4 text-[#E5C158]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>2. Bathroom scrubbed, sanitized & hot geyser verified</span>
              </label>

              <label
                className="flex items-center gap-2.5 cursor-pointer select-none"
                onClick={() => setChecklist((c) => ({ ...c, acRemote: !c.acRemote }))}
              >
                {checklist.acRemote ? (
                  <CheckSquare className="w-4 h-4 text-[#E5C158]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>3. AC dusted, filters checked & remote tested</span>
              </label>

              <label
                className="flex items-center gap-2.5 cursor-pointer select-none"
                onClick={() => setChecklist((c) => ({ ...c, floorsMopped: !c.floorsMopped }))}
              >
                {checklist.floorsMopped ? (
                  <CheckSquare className="w-4 h-4 text-[#E5C158]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>4. Dusting, sweeping & floor mopped with fragrant disinfectant</span>
              </label>

              <label
                className="flex items-center gap-2.5 cursor-pointer select-none"
                onClick={() => setChecklist((c) => ({ ...c, trashEmptied: !c.trashEmptied }))}
              >
                {checklist.trashEmptied ? (
                  <CheckSquare className="w-4 h-4 text-[#E5C158]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>5. Trash bins emptied & fresh liners placed</span>
              </label>

              <label
                className="flex items-center gap-2.5 cursor-pointer select-none"
                onClick={() => setChecklist((c) => ({ ...c, waterKettle: !c.waterKettle }))}
              >
                {checklist.waterKettle ? (
                  <CheckSquare className="w-4 h-4 text-[#E5C158]" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>6. Complimentary water bottles & tea/coffee kettle restocked</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Inspected / Cleaned By</label>
                <input
                  type="text"
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  placeholder="Staff member name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-[#C59B27] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Supervisor Notes (Optional)</label>
                <input
                  type="text"
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="e.g. Extra blanket provided"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 focus:border-[#C59B27] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitInspection}
                disabled={savingInspection}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{savingInspection ? "Saving..." : "Sign-Off as CLEAN"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
