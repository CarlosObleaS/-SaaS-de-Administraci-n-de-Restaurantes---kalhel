"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type OrderStatus = "PENDIENTE" | "EN_PREPARACION" | "SERVIDO";

type Order = {
  id: string;
  tableNumber: string;
  status: OrderStatus;
  createdAt: string;
  items: { id: string; menuItemId: string; qty: number; price: number; menuItem?: { name: string } }[];
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

export default function PedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // form state
  const [tableNumber, setTableNumber] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState<{ menuItemId: string; name: string; qty: number; price: number }[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") ?? "";
      const [ordersRes, menuRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/active`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/items`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!ordersRes.ok) throw new Error("No se pudieron cargar los pedidos");
      if (!menuRes.ok) throw new Error("No se pudieron cargar los platos");
      const ordersData = await ordersRes.json();
      const menuData = await menuRes.json();
      setOrders(ordersData);
      setMenuItems(menuData);
      if (menuData.length > 0) setSelectedItemId(menuData[0].id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statusCounts = useMemo(() => {
    const pending = orders.filter((o) => o.status === "PENDIENTE").length;
    const prep = orders.filter((o) => o.status === "EN_PREPARACION").length;
    const served = orders.filter((o) => o.status === "SERVIDO").length;
    return { pending, prep, served };
  }, [orders]);

  const totalCart = useMemo(
    () => cart.reduce((acc, item) => acc + item.qty * item.price, 0),
    [cart]
  );

  const addToCart = () => {
    const item = menuItems.find((i) => i.id === selectedItemId);
    if (!item) return;
    setCart((prev) => {
      const existing = prev.find((p) => p.menuItemId === item.id);
      if (existing) {
        return prev.map((p) =>
          p.menuItemId === item.id ? { ...p, qty: p.qty + qty } : p
        );
      }
      return [...prev, { menuItemId: item.id, name: item.name, qty, price: item.price }];
    });
  };

  const createOrder = async () => {
    if (!tableNumber || cart.length === 0) return;
    setCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") ?? "";
      const body = {
        tableNumber,
        items: cart.map((c) => ({
          menuItemId: c.menuItemId,
          qty: c.qty,
          price: c.price,
        })),
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("No se pudo crear el pedido");
      await res.json();
      setTableNumber("");
      setCart([]);
      setQty(1);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    const token = localStorage.getItem("token") ?? "";
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) loadData();
  };

  return (
    <section className="pb-16">
      <div className="mb-6 flex items-center gap-3">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
          onClick={() => router.back()}
          aria-label="Volver"
        >
          ←
        </button>
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Estado de Pedidos</h1>
          <p className="text-slate-500">Gestiona el estado de todos los pedidos activos</p>
        </div>
      </div>

      <div className="mb-6 rounded-3xl border border-[#E7DCD2] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Nuevo pedido</h3>
        <div className="flex flex-wrap gap-3">
          <input
            className="h-11 rounded-xl border border-slate-200 px-4 outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="Mesa (ej. 5)"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
          <select
            className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-orange-300"
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
          >
            {menuItems.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} (${i.price})
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            className="h-11 w-20 rounded-xl border border-slate-200 px-3 outline-none focus:ring-2 focus:ring-orange-300"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          />
          <button
            type="button"
            className="h-11 rounded-xl bg-orange-500 px-4 text-white hover:bg-orange-600"
            onClick={addToCart}
            disabled={!selectedItemId}
          >
            Añadir
          </button>
        </div>
        {cart.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {cart.map((c) => (
              <span key={c.menuItemId} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                {c.qty}x {c.name}
              </span>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Total estimado</span>
          <span className="text-lg font-semibold text-emerald-700">${totalCart.toFixed(2)}</span>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            className="h-11 rounded-xl bg-orange-500 px-5 text-white hover:bg-orange-600 disabled:opacity-60"
            onClick={createOrder}
            disabled={creating || !tableNumber || cart.length === 0}
          >
            {creating ? "Creando..." : "Crear pedido"}
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Pendientes" value={statusCounts.pending} icon="🕒" color="text-orange-500" />
        <StatCard label="En preparación" value={statusCounts.prep} icon="👨‍🍳" color="text-orange-500" />
        <StatCard label="Servidos" value={statusCounts.served} icon="✅" color="text-emerald-600" />
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600">{error}</div>}

      {loading ? (
        <p className="text-slate-500">Cargando pedidos...</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={updateStatus} />
          ))}
          {orders.length === 0 && <p className="text-slate-500">No hay pedidos activos.</p>}
        </div>
      )}
    </section>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className="card flex items-center justify-between rounded-2xl border border-[#E7DCD2] bg-[#FFF8F0] px-5 py-4">
      <div>
        <div className="text-slate-500">{label}</div>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
      </div>
      <div className={`text-2xl ${color}`}>{icon}</div>
    </div>
  );
}

function OrderCard({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const statusColor =
    order.status === "PENDIENTE"
      ? "bg-amber-100 text-amber-600"
      : order.status === "EN_PREPARACION"
        ? "bg-orange-100 text-orange-600"
        : "bg-emerald-100 text-emerald-600";

  const statusLabel =
    order.status === "PENDIENTE"
      ? "Pendiente"
      : order.status === "EN_PREPARACION"
        ? "En preparación"
        : "Servido";

  return (
    <article className="card rounded-3xl border border-[#E7DCD2] bg-white p-5 shadow-md transition hover:-translate-y-1">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-2xl text-white">
          👤
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-900">Mesa {order.tableNumber}</h3>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}>{statusLabel}</span>
          </div>
          <p className="text-sm text-slate-500">Pedido #{order.id.slice(0, 6)}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
        <div className="mb-2 font-semibold text-slate-800">Productos:</div>
        <ul className="space-y-1">
          {order.items.map((it) => (
            <li key={it.id}>
              • {it.qty}x {it.menuItem?.name ?? ""} (${(it.price * it.qty).toFixed(2)})
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">Total</span>
        <span className="text-lg font-semibold text-emerald-700">
          ${order.items.reduce((acc, it) => acc + it.qty * it.price, 0).toFixed(2)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        {[
          { label: "Pendiente", value: "PENDIENTE" },
          { label: "En preparación", value: "EN_PREPARACION" },
          { label: "Servido", value: "SERVIDO" },
        ].map((step) => {
          const active = order.status === step.value;
          return (
            <button
              key={step.value}
              className={`rounded-full px-3 py-2 ${
                active ? "bg-orange-500 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              onClick={() => onStatusChange(order.id, step.value as OrderStatus)}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    </article>
  );
}
