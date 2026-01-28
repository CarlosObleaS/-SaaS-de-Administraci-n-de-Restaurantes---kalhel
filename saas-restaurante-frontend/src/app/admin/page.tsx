"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <section className="pb-16">
      <h1 className="text-4xl font-bold text-slate-900">Panel administrador</h1>
      <p className="mt-2 text-slate-500">Bienvenido al sistema de gestión de tu restaurante</p>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-4">
        <StatCard title="Ventas hoy" value="$2,450" icon="💰" />
        <StatCard title="Pedidos activos" value="12" icon="🕒" />
        <StatCard title="Platos en carta" value="48" icon="🍽️" />
        <StatCard title="Tendencia" value="+18%" icon="📈" />
      </div>

      <h2 className="mt-12 text-2xl font-bold text-slate-900">Gestión del restaurante</h2>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <ActionCard title="Carta" subtitle="Gestionar platos y bebidas" icon="🍝" href="/admin/carta" />
        <ActionCard title="Pedidos" subtitle="Ver pedidos activos" icon="🧑‍🍳" href="/admin/pedidos" />
        <ActionCard title="Categorías" subtitle="Organizar carta" icon="🏷️" href="/admin/categorias" />
        <ActionCard title="Menú QR" subtitle="Ver menú digital" icon="🔗" href="/admin/menu-qr" />
        <ActionCard title="Usuarios" subtitle="Gestionar personal" icon="👥" href="#" />
        <ActionCard title="Ticketera" subtitle="Configurar impresora" icon="🖨️" href="#" />
        <ActionCard title="Suscripción" subtitle="Plan y facturación" icon="💳" href="#" />
      </div>
    </section>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="card flex items-center justify-between rounded-2xl border border-[#E7DCD2] bg-[#FFF8F0] p-5">
      <div>
        <div className="text-sm text-slate-500">{title}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-xl">{icon}</div>
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
