"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  UtensilsCrossed,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Printer,
  Edit3,
  Trash2,
  Save,
  X,
  Clock,
  Coffee,
  Flame,
  ChefHat,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { HOTEL_INFO } from "@/lib/constants";

export default function AdminRestaurantPage() {
  const [view, setView] = useState<"pos" | "menu" | "orders">("pos");
  const [categories, setCategories] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  // POS State
  const [selectedTable, setSelectedTable] = useState("T-3");
  const [orderType, setOrderType] = useState<"DINE_IN" | "ROOM_SERVICE">("DINE_IN");
  const [roomNumber, setRoomNumber] = useState("101");
  const [cart, setCart] = useState<any[]>([]);
  const [posCategory, setPosCategory] = useState("All");
  const [posSearch, setPosSearch] = useState("");
  const [steward, setSteward] = useState("Steaward");

  // Menu Management State
  const [menuSearch, setMenuSearch] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemPrice, setEditItemPrice] = useState("");
  const [showAddDishModal, setShowAddDishModal] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishCategory, setNewDishCategory] = useState("south-indian");
  const [newDishPrice, setNewDishPrice] = useState("");
  const [newDishJain, setNewDishJain] = useState(false);
  const [newDishSpecial, setNewDishSpecial] = useState(false);
  const [newDishDesc, setNewDishDesc] = useState("");

  // Receipt Modal State
  const [receiptOrder, setReceiptOrder] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [menuRes, tablesRes, ordersRes] = await Promise.all([
        fetch("/api/admin/menu"),
        fetch("/api/admin/tables"),
        fetch("/api/admin/orders"),
      ]);
      const menuData = await menuRes.json();
      const tablesData = await tablesRes.json();
      const ordersData = await ordersRes.json();

      if (menuData.categories) setCategories(menuData.categories);
      if (tablesData.tables) setTables(tablesData.tables);
      if (ordersData.orders) setOrders(ordersData.orders);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cart operations
  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          unitPrice: item.price,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.menuItemId === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  // Financial calculations
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );
  const cartCgst = parseFloat((cartSubtotal * 0.025).toFixed(2));
  const cartSgst = parseFloat((cartSubtotal * 0.025).toFixed(2));
  const cartGrandTotal = Math.round(cartSubtotal + cartCgst + cartSgst);

  const handleCreateOrder = async () => {
    if (cart.length === 0) {
      alert("Please select items for this order.");
      return;
    }

    const token = localStorage.getItem("edesiea_staff_token");

    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tableId: orderType === "DINE_IN" ? selectedTable : null,
          orderType,
          stewardName: steward,
          items: cart,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCart([]);
        setNotice(`Order ${data.order.orderNumber} sent to Kitchen KOT!`);
        setReceiptOrder(data.order);
        fetchData();
        setTimeout(() => setNotice(""), 4000);
      } else {
        alert(data.error || "Failed to create order");
      }
    } catch {
      alert("Error sending order");
    }
  };

  const handleUpdatePrice = async (itemId: string) => {
    const token = localStorage.getItem("edesiea_staff_token");
    try {
      const res = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: itemId,
          price: editItemPrice,
        }),
      });

      if (res.ok) {
        setEditingItemId(null);
        setNotice("Dish price updated successfully!");
        fetchData();
        setTimeout(() => setNotice(""), 3000);
      } else {
        alert("Failed to update price");
      }
    } catch {
      alert("Error updating price");
    }
  };

  const handleToggleSoldOut = async (itemId: string, currentAvailable: boolean) => {
    const token = localStorage.getItem("edesiea_staff_token");
    try {
      await fetch("/api/admin/menu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: itemId,
          isAvailable: !currentAvailable,
        }),
      });
      fetchData();
    } catch {
      alert("Error updating availability");
    }
  };

  const handleDeleteDish = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    const token = localStorage.getItem("edesiea_staff_token");
    try {
      const res = await fetch(`/api/admin/menu?id=${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("Cannot delete item with order history");
      }
    } catch {
      alert("Error deleting item");
    }
  };

  const handleAddDish = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("edesiea_staff_token");
    try {
      const res = await fetch("/api/admin/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newDishName,
          categoryId: newDishCategory,
          price: newDishPrice,
          isJainAvailable: newDishJain,
          isChefSpecial: newDishSpecial,
          description: newDishDesc,
        }),
      });

      if (res.ok) {
        setShowAddDishModal(false);
        setNewDishName("");
        setNewDishPrice("");
        setNewDishDesc("");
        setNotice("New dish added to restaurant menu!");
        fetchData();
        setTimeout(() => setNotice(""), 3000);
      } else {
        alert("Failed to add dish");
      }
    } catch {
      alert("Error adding dish");
    }
  };

  const allItems = categories.flatMap((c) => c.menuItems || []);
  const filteredMenuItems = allItems.filter((i) =>
    i.name.toLowerCase().includes(menuSearch.toLowerCase())
  );

  const posItems = allItems.filter((i) => {
    const matchCat = posCategory === "All" || i.categoryId === posCategory;
    const matchSearch =
      !posSearch || i.name.toLowerCase().includes(posSearch.toLowerCase());
    return matchCat && matchSearch && i.isAvailable;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#E5C158] font-bold">
            Edelisa Authenticity Restaurant
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
            Restaurant Management, POS Billing & Menu Editor
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            100% Pure Veg • Ground Floor & Rooftop 4th/5th Floor • Pali, Maharashtra
          </p>
        </div>

        <div className="flex gap-2">
          {["pos", "menu", "orders"].map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab as any)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                view === tab
                  ? "bg-[#C59B27] text-slate-950 font-bold shadow"
                  : "bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              }`}
            >
              {tab === "pos"
                ? "POS & New Bill"
                : tab === "menu"
                ? "Menu & Price Editor"
                : "Active Orders / KOT"}
            </button>
          ))}
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-lg text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* VIEW 1: POS BILLING & NEW ORDER */}
      {view === "pos" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Menu Item Selector (7 cols) */}
          <div className="lg:col-span-7 bg-slate-800/80 rounded-xl border border-slate-700 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Quick search dishes..."
                  value={posSearch}
                  onChange={(e) => setPosSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-[#E5C158] font-bold"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} ({t.floor}) — {t.status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setPosCategory("All")}
                className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                  posCategory === "All"
                    ? "bg-[#C59B27] text-slate-950"
                    : "bg-slate-900 text-slate-400"
                }`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setPosCategory(c.id)}
                  className={`px-3 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                    posCategory === c.id
                      ? "bg-[#C59B27] text-slate-950"
                      : "bg-slate-900 text-slate-400"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {posItems.map((dish) => (
                <div
                  key={dish.id}
                  onClick={() => addToCart(dish)}
                  className="p-3 bg-slate-900 hover:bg-slate-750 border border-slate-700 hover:border-[#C59B27] rounded-xl cursor-pointer transition-all flex flex-col justify-between space-y-2 select-none group"
                >
                  <div>
                    <h4 className="font-serif font-bold text-white text-xs group-hover:text-[#E5C158]">
                      {dish.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {dish.isJainAvailable ? "🌿 Jain Avail" : "Regular"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="font-serif text-sm font-bold text-[#E5C158]">
                      ₹{dish.price}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-white">
                      + Add
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Ticket / Bill Sidebar (5 cols) */}
          <div className="lg:col-span-5 bg-slate-800/80 rounded-xl border border-slate-700 p-5 space-y-4 sticky top-24">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <div>
                <h3 className="font-serif text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#C59B27]" />
                  <span>Current Ticket ({selectedTable})</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Steward: {steward} • Covers: {cart.length} items
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-red-400 hover:text-red-300 text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Cart Items */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center justify-between p-2 bg-slate-900 rounded-lg text-xs"
                >
                  <div className="flex-1 mr-2">
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="text-[10px] text-slate-400">
                      ₹{item.unitPrice} x {item.quantity} = ₹
                      {item.unitPrice * item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.menuItemId, -1)}
                      className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, 1)}
                      className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-white rounded flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Tap dishes from the left to add to this ticket.
                </div>
              )}
            </div>

            {/* Bill Summary (Matches EAR_649) */}
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-700/80 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Sub Total:</span>
                <span className="font-semibold text-white">
                  ₹{cartSubtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>CGST (2.5%):</span>
                <span>₹{cartCgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>SGST (2.5%):</span>
                <span>₹{cartSgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-700 pt-2 font-serif text-sm font-bold text-white">
                <span>Net Payable:</span>
                <span className="text-[#E5C158]">₹{cartGrandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleCreateOrder}
                disabled={cart.length === 0}
                className="w-full py-3 bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold rounded-lg text-xs shadow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ChefHat className="w-4 h-4" />
                <span>Fire KOT & Print Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE MENU & PRICE EDITOR */}
      {view === "menu" && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-700 pb-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search menu items to edit price..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>

            <button
              onClick={() => setShowAddDishModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#C59B27] to-[#E5C158] text-slate-950 font-bold rounded-lg text-xs shadow flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Menu Item</span>
            </button>
          </div>

          {/* Menu Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Dish Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Price</th>
                  <th className="py-3 px-4">Jain Status</th>
                  <th className="py-3 px-4">Chef Special</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 font-medium">
                {filteredMenuItems.map((dish) => (
                  <tr key={dish.id} className="hover:bg-slate-750">
                    <td className="py-3 px-4 font-bold text-white">
                      {dish.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{dish.categoryId}</td>
                    <td className="py-3 px-4 font-serif text-sm font-bold text-[#E5C158]">
                      {editingItemId === dish.id ? (
                        <div className="flex items-center gap-1">
                          <span>₹</span>
                          <input
                            type="number"
                            value={editItemPrice}
                            onChange={(e) => setEditItemPrice(e.target.value)}
                            className="w-20 px-2 py-0.5 bg-slate-950 border border-[#C59B27] rounded text-white text-xs"
                          />
                          <button
                            onClick={() => handleUpdatePrice(dish.id)}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-500"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            className="p-1 bg-slate-800 text-slate-400 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span>₹{dish.price}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {dish.isJainAvailable ? (
                        <span className="text-emerald-400 font-semibold">
                          🌿 Jain
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {dish.isChefSpecial ? (
                        <span className="text-amber-400 font-semibold">
                          ★ Special
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          handleToggleSoldOut(dish.id, dish.isAvailable)
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dish.isAvailable
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                            : "bg-red-950 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {dish.isAvailable ? "Available" : "Sold Out"}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editingItemId !== dish.id && (
                          <button
                            onClick={() => {
                              setEditingItemId(dish.id);
                              setEditItemPrice(dish.price.toString());
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-[#E5C158] rounded"
                            title="Edit Price"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteDish(dish.id)}
                          className="p-1.5 bg-slate-800 hover:bg-red-900/60 text-slate-400 hover:text-red-300 rounded"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: ACTIVE ORDERS / KOT */}
      {view === "orders" && (
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden shadow">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Order / Bill #</th>
                <th className="py-3 px-4">Table / Room</th>
                <th className="py-3 px-4">Items Ordered</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">GST (5%)</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">KOT Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 font-medium">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-750">
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {o.orderNumber}
                  </td>
                  <td className="py-3 px-4 text-[#E5C158] font-bold">
                    {o.table?.tableNumber || o.orderType}
                  </td>
                  <td className="py-3 px-4">
                    {o.items?.map((it: any) => `${it.quantity}x ${it.itemName}`).join(", ")}
                  </td>
                  <td className="py-3 px-4">₹{o.subTotal}</td>
                  <td className="py-3 px-4 text-slate-400">
                    ₹{(o.cgst + o.sgst).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 font-serif text-sm font-bold text-white">
                    ₹{o.grandTotal}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/30">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setReceiptOrder(o)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-700 text-[#E5C158] rounded text-[11px] font-semibold border border-slate-700 flex items-center gap-1 ml-auto"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Bill</span>
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No active restaurant orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New Dish Modal */}
      {showAddDishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-slate-100">
            <button
              onClick={() => setShowAddDishModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-lg font-bold text-white">
              Add New Dish to Restaurant Menu
            </h3>

            <form onSubmit={handleAddDish} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kaju Paneer Masala"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Category *
                  </label>
                  <select
                    value={newDishCategory}
                    onChange={(e) => setNewDishCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="280"
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDishJain}
                    onChange={(e) => setNewDishJain(e.target.checked)}
                    className="w-4 h-4 text-[#C59B27] rounded"
                  />
                  <span>🌿 Jain Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDishSpecial}
                    onChange={(e) => setNewDishSpecial(e.target.checked)}
                    className="w-4 h-4 text-[#C59B27] rounded"
                  />
                  <span>★ Chef Special</span>
                </label>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">
                  Description / Inclusions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prepared in pure desi ghee with cashew paste and rich gravy"
                  value={newDishDesc}
                  onChange={(e) => setNewDishDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDishModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C59B27] text-slate-950 font-bold rounded-lg shadow"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill Receipt Modal (Styled exactly like authentic customer bill EAR_649) */}
      {receiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 font-mono text-xs">
            <button
              onClick={() => setReceiptOrder(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-900"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-0.5 border-b pb-3">
              <h3 className="font-bold text-base tracking-wider">HOTEL EDESIEA</h3>
              <p className="text-[11px]">Edelisa Authenticity Restaurant</p>
              <p className="text-[10px] text-slate-600">
                Shree Ballaleshwar, Devshthan Temple Road
              </p>
              <p className="text-[10px] text-slate-600">
                Pali, Maharashtra, India
              </p>
              <p className="text-[10px] text-slate-600">
                Email : edesieaoffice@gmail.com
              </p>
              <p className="text-[10px] text-slate-600">GSTIN No. : 27XXXXXXXXXXZX</p>
            </div>

            <div className="flex justify-between text-[11px] border-b pb-2">
              <div>
                <p>Bill No: {receiptOrder.orderNumber}</p>
                <p>
                  Date: {new Date(receiptOrder.createdAt || Date.now()).toLocaleDateString()}{" "}
                  {new Date(receiptOrder.createdAt || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>Table : {receiptOrder.table?.tableNumber || receiptOrder.orderType}</p>
              </div>
              <div className="text-right">
                <p>STWD: {receiptOrder.stewardName || "Steaward"}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="space-y-1.5 border-b pb-3 text-[11px]">
              <div className="flex justify-between font-bold border-b pb-1 text-[10px]">
                <span className="w-1/2">Item Name</span>
                <span className="w-1/6 text-center">Qty</span>
                <span className="w-1/6 text-right">Rate</span>
                <span className="w-1/6 text-right">Amt</span>
              </div>
              {receiptOrder.items?.map((it: any, i: number) => (
                <div key={i} className="flex justify-between">
                  <span className="w-1/2 truncate">{it.itemName}</span>
                  <span className="w-1/6 text-center">{it.quantity}.00</span>
                  <span className="w-1/6 text-right">{it.unitPrice.toFixed(2)}</span>
                  <span className="w-1/6 text-right">{it.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between font-bold">
                <span>Sub Total</span>
                <span>{receiptOrder.subTotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>CGST 2.5% @2.50%</span>
                <span>{receiptOrder.cgst?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST 2.5% @2.50%</span>
                <span>{receiptOrder.sgst?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-b py-1 pt-1.5">
                <span>Net Payable</span>
                <span>₹{receiptOrder.grandTotal?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0E1A2B] text-[#E5C158] font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Bill</span>
              </button>
              <button
                onClick={() => setReceiptOrder(null)}
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
