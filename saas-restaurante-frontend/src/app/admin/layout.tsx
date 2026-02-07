"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type Role = "ADMIN" | "MESERO" | null;

/** Rutas permitidas sin suscripción activa (incluye subrutas: carta/nuevo, categorias/nueva, etc.) */
function isAllowedWithoutSub(path: string): boolean {
  return (
    path === "/admin" ||
    path.startsWith("/admin/suscripcion") ||
    path.startsWith("/admin/carta") ||
    path.startsWith("/admin/categorias")
  );
}

const navItemsByRole = {
  ADMIN: [
    { href: "/admin", label: "Panel" },
    { href: "/admin/carta", label: "Carta" },
    { href: "/admin/pedidos", label: "Pedidos" },
    { href: "/admin/categorias", label: "Categorías" },
    { href: "/admin/usuarios", label: "Usuarios" },
    { href: "/admin/menu-qr", label: "Menú QR" },
    { href: "/admin/suscripcion", label: "Suscripción" },
  ],
  MESERO: [
    { href: "/admin/pedidos", label: "Pedidos" },
    { href: "/admin/menu-qr", label: "Menú QR" },
    { href: "/admin/ticketera", label: "Ticketera" },
    { href: "/admin/suscripcion", label: "Suscripción" },
  ],
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);
  const [subOk, setSubOk] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole === "ADMIN" || storedRole === "MESERO") {
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  // Verificar que la suscripción del restaurante esté activa o en trial vigente.
  useEffect(() => {
    const checkSubscription = async () => {
      const token = localStorage.getItem("token") ?? "";
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setSubOk(false);
          if (!isAllowedWithoutSub(pathname)) {
            router.push("/admin/suscripcion");
          }
          return;
        }

        const sub = await res.json();
        const now = new Date();
        const isTrial =
          sub?.status === "TRIAL" &&
          sub?.trialEndsAt &&
          now <= new Date(sub.trialEndsAt);
        const isActive = sub?.status === "ACTIVE";

        if (!isTrial && !isActive) {
          setSubOk(false);
          if (!isAllowedWithoutSub(pathname)) {
            router.push("/admin/suscripcion");
          }
        } else {
          setSubOk(true);
        }
      } catch (err) {
        setSubOk(false);
        if (!isAllowedWithoutSub(pathname)) {
          router.push("/admin/suscripcion");
        }
      }
    };

    checkSubscription();
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  if (loading || subOk === null) return null;

  const isSubscriptionPage = pathname === "/admin/suscripcion";
  const isRestrictedPage =
    pathname.startsWith("/admin") && !isAllowedWithoutSub(pathname);

  // Mostrar siempre el panel de inicio, suscripción, carta y categorías (incl. subrutas).
  // En el resto de páginas, si no hay suscripción, ocultamos el contenido
  // para evitar que se vea ni un instante antes de la redirección.
  const showChildren =
    !isRestrictedPage || subOk === true || isAllowedWithoutSub(pathname);

  let navItems = role ? navItemsByRole[role] : [];

  return (
    <div className="min-h-screen bg-[#FDF7F1] text-slate-800">
      <header className="sticky top-0 z-30 border-b border-[#E7DCD2] bg-[#FFF8F0]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-lg font-bold text-white shadow-md">
              R
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-slate-900">
                Mi Restaurante
              </div>
              <div className="text-xs text-slate-500">
                {role === "MESERO" ? "Panel de Mesero" : "Sistema de Gestión"}
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-4 text-sm sm:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const isRestricted =
                subOk === false && !isAllowedWithoutSub(item.href);

              if (isRestricted) {
                return (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => router.push("/admin/suscripcion")}
                    className="rounded-full px-3 py-2 text-slate-400 cursor-not-allowed"
                    title="Requiere suscripción activa"
                  >
                    {item.label}
                  </button>
                );
              }

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
              onClick={handleLogout}
              className="ml-2 text-red-500 transition hover:text-red-600"
            >
              Salir
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#E7DCD2] bg-white px-4 text-sm text-slate-700 shadow-sm sm:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            Menú
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          />
          <div className="absolute right-0 top-0 h-full w-[82%] max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Navegación
                </div>
                <div className="text-xs text-slate-500">
                  {role === "MESERO" ? "Mesero" : "Administrador"}
                </div>
              </div>
              <button
                className="h-10 rounded-full px-3 text-slate-600 hover:bg-slate-100"
                onClick={() => setMobileOpen(false)}
              >
                Cerrar
              </button>
            </div>

            <div className="p-3">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  const isRestricted =
                    subOk === false && !isAllowedWithoutSub(item.href);

                  if (isRestricted) {
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          router.push("/admin/suscripcion");
                        }}
                        className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-400"
                        title="Requiere suscripción activa"
                      >
                        {item.label}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-sm ${
                        active
                          ? "bg-orange-500 text-white"
                          : "text-slate-700 hover:bg-orange-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl bg-red-50 px-4 py-3 text-left text-sm text-red-600"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {showChildren ? children : null}
      </main>
    </div>
  );
}

