"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/carta", label: "Carta" },
  { href: "/admin/pedidos", label: "Mesero" },
  { href: "/admin/categorias", label: "Categor�as" },
  { href: "/admin/menu-qr", label: "Men� QR" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#FDF7F1] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-[#E7DCD2] bg-[#FFF8F0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white shadow-md">
              R
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-slate-900">Mi Restaurante</div>
              <div className="text-xs text-slate-500">Sistema de Gestión</div>
            </div>
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 transition ${
                    active
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-orange-50 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <button
              className="ml-2 text-red-500 transition hover:text-red-600"
              onClick={handleLogout}
            >
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
