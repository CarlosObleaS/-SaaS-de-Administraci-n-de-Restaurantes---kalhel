"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Subscription = {
  status: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string | null;
  stripeSubId?: string | null;
};

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="card flex items-center justify-between rounded-2xl border border-[#E7DCD2] bg-[#FFF8F0] p-5">
      <div>
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl">
        {icon}
      </div>
    </div>
  );
}

function ActionCard({
  title,
  subtitle,
  icon,
  href,
}: {
  title: string;
  subtitle: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="card flex items-center gap-4 rounded-2xl border border-[#E7DCD2] bg-[#FFF8F0] p-6 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-2xl text-white">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500">{subtitle}</div>
      </div>
    </Link>
  );
}

function ActionCardLocked({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: string;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.push("/admin/suscripcion")}
      className="card flex w-full items-center gap-4 rounded-2xl border border-[#E7DCD2] bg-[#F5F0EB]/60 p-6 text-left opacity-75 transition hover:opacity-90"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-300 text-2xl text-white">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-slate-600">{title}</div>
        <div className="text-sm text-slate-400">{subtitle}</div>
      </div>
      <span className="text-slate-400" title="Requiere suscripción activa">
        🔒
      </span>
    </button>
  );
}

function getPlanLabel(sub: Subscription | null, active: boolean): string {
  if (!active) return "";
  if (!sub) return "Pro";
  if (sub.status === "TRIAL") return "Trial";
  const id = sub.stripeSubId ?? "";
  const match = id.match(/(?:stripe|paypal|culqi):(\w+)/i);
  const plan = match ? match[1] : "";
  const map: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    enterprise: "Enterprise",
  };
  return map[plan] ?? "Pro";
}

function isSubscriptionActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  const now = new Date();
  if (sub.status === "TRIAL" && sub.trialEndsAt) {
    return now <= new Date(sub.trialEndsAt);
  }
  return sub.status === "ACTIVE";
}

export default function AdminPage() {
  const [role, setRole] = useState<"ADMIN" | "MESERO" | null>(null);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [subOk, setSubOk] = useState(false);
  const [salesToday, setSalesToday] = useState<number | null>(null);
  const [activeOrders, setActiveOrders] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<number | null>(null);
  const [trendPercent, setTrendPercent] = useState<number | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole === "ADMIN" || storedRole === "MESERO") {
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  // Cargar estado de suscripción
  useEffect(() => {
    const token = localStorage.getItem("token") ?? "";
    if (!token) return;

    const fetchSub = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/subscription`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const data = await res.json();
        setSub(data);
        setSubOk(isSubscriptionActive(data));
      } catch {
        setSubOk(false);
      }
    };

    fetchSub();
  }, []);

  // Cargar estadísticas del panel (sólo ADMIN y con suscripción activa)
  useEffect(() => {
    if (role !== "ADMIN" || !subOk) return;

    let cancelled = false;

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token") ?? "";
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/admin`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) return;

        const data = await res.json();
        if (cancelled) return;

        setSalesToday(data.salesToday ?? 0);
        setActiveOrders(data.activeOrders ?? 0);
        setMenuItems(data.menuItems ?? 0);
        setTrendPercent(data.trendPercent ?? 0);
      } catch {
        // silencioso por ahora
      }
    };

    fetchStats();
    const id = setInterval(fetchStats, 5000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [role, subOk]);

  if (loading) return null;

  const isMesero = role === "MESERO";
  const planLabel = getPlanLabel(sub, subOk);
  const sectionTitle = subOk
    ? `Gestión del restaurante - Suscripción ${planLabel}`
    : "Gestión del restaurante - Sin Suscripción";

  const cardsWithoutSub = [
    ...(!isMesero
      ? [
          { title: "Carta", subtitle: "Gestionar platos y bebidas", icon: "🍝" as const, href: "/admin/carta" },
          { title: "Categorías", subtitle: "Organizar carta", icon: "🏷️" as const, href: "/admin/categorias" },
        ]
      : []),
    { title: "Suscripción", subtitle: "Plan y facturación", icon: "💳" as const, href: "/admin/suscripcion" },
  ];

  const cardsWithSub = [
    { title: "Pedidos", subtitle: "Ver pedidos activos", icon: "🧑‍🍳", href: "/admin/pedidos" },
    { title: "Menú QR", subtitle: "Ver menú digital", icon: "🗒", href: "/admin/menu-qr" },
    { title: "Ticketera", subtitle: "Configurar impresora", icon: "🖨️", href: "/admin/ticketera" },
    ...(!isMesero ? [{ title: "Usuarios", subtitle: "Gestionar personal", icon: "👥", href: "/admin/usuarios" as string }] : []),
  ];

  return (
    <section className="pb-16">
      <h1 className="text-4xl font-bold text-slate-900">
        Panel {isMesero ? "Mesero" : "Administrador"}
      </h1>

      <p className="mt-2 text-slate-500">
        {isMesero
          ? "Acceso operativo para atención al cliente"
          : "Bienvenido al sistema de gestión de tu restaurante"}
      </p>

      {/* STATS (solo ADMIN con suscripción activa) */}
      {!isMesero && subOk && (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard
            title="Ventas hoy"
            value={salesToday !== null ? formatPrice(salesToday) : "—"}
            icon="💰"
          />
          <StatCard
            title="Pedidos activos"
            value={activeOrders !== null ? String(activeOrders) : "—"}
            icon="🕒"
          />
          <StatCard
            title="Platos en carta"
            value={menuItems !== null ? String(menuItems) : "—"}
            icon="🍝"
          />
          <StatCard
            title="Tendencia"
            value={
              trendPercent !== null
                ? `${trendPercent >= 0 ? "+" : ""}${trendPercent.toFixed(0)}%`
                : "—"
            }
            icon="📈"
          />
        </div>
      )}

      {/* SECCIÓN: Sin suscripción (siempre visible para admin) */}
      <h2 className="mt-12 text-2xl font-bold text-slate-900">
        {sectionTitle}
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {subOk ? (
          <>
            {cardsWithoutSub.map((c) => (
              <ActionCard
                key={c.href}
                title={c.title}
                subtitle={c.subtitle}
                icon={c.icon}
                href={c.href}
              />
            ))}
            {cardsWithSub.map((c) => (
              <ActionCard
                key={c.href}
                title={c.title}
                subtitle={c.subtitle}
                icon={c.icon}
                href={c.href}
              />
            ))}
          </>
        ) : (
          <>
            {cardsWithoutSub.map((c) => (
              <ActionCard
                key={c.href}
                title={c.title}
                subtitle={c.subtitle}
                icon={c.icon}
                href={c.href}
              />
            ))}
          </>
        )}
      </div>

      {/* SECCIÓN: Posible gestión con suscripción (solo cuando está inactiva) */}
      {!subOk && cardsWithSub.length > 0 && (
        <>
          <h2 className="mt-12 text-xl font-semibold text-slate-600">
            Posible Gestión del restaurante - Con Suscripción
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Activa tu suscripción para acceder a estas funciones
          </p>
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
            {cardsWithSub.map((c) => (
              <ActionCardLocked
                key={c.href}
                title={c.title}
                subtitle={c.subtitle}
                icon={c.icon}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}


