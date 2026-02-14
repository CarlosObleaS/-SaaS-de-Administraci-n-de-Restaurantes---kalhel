"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/formatPrice";

type Item = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string | null;
  isActive: boolean;
  category?: { name: string };
};

type PublicMenu = {
  categories: {
    id: string;
    name: string;
    items: Item[];
  }[];
};

export default function MenuQrPage() {
  const router = useRouter();
  const [active, setActive] = useState("Todo");
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuUrl, setMenuUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const storedSlug =
          typeof window !== "undefined"
            ? localStorage.getItem("restaurantSlug")
            : null;
        const slug =
          storedSlug || process.env.NEXT_PUBLIC_RESTAURANT_SLUG || "demo-resto";

        // URL pública del menú para usar en el QR
        if (typeof window !== "undefined") {
          const origin = window.location.origin;
          setMenuUrl(`${origin}/menu/${slug}`);
        }
        // Primero intenta con token (admin) para sincronizar con Gestión de Platos
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;
        if (token) {
          const resAuth = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/menu/items`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (resAuth.ok) {
            const dataAuth: Item[] = await resAuth.json();
            setItems(dataAuth);
            return;
          }
        }
        // Fallback público por slug
        const url = `${process.env.NEXT_PUBLIC_API_URL}/public/restaurants/${slug}/menu`;
        const res = await fetch(url);
        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(
            `No se pudo cargar el menú (${res.status}). Slug: ${slug}. ${body}`
          );
        }
        const data: PublicMenu = await res.json();
        const flat = data.categories.flatMap((c) =>
          c.items.map((i) => ({ ...i, category: { name: c.name } }))
        );
        setItems(flat);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.category?.name && set.add(i.category.name));
    return ["Todo", ...Array.from(set)];
  }, [items]);

  const visibleItems = useMemo(() => {
    return items
      .filter((i) => i.isActive) // ocultar si está desactivado
      .filter((i) => (active === "Todo" ? true : i.category?.name === active))
      .filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
  }, [items, active, search]);

  return (
    <section className="pb-16">
      <div className="mb-4 flex items-center">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
          onClick={() => router.back()}
          aria-label="Volver"
        >
          ←
        </button>
      </div>
      <div className="rounded-3xl bg-[#FFF6ED] p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-2xl text-white shadow">
          🍴
        </div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-4xl">
          Menú Digital
        </h1>
        <p className="text-sm text-slate-500 sm:text-base">
          Explora nuestros deliciosos platos
        </p>
        <div className="mt-2 text-sm text-slate-500">🧾 Acceso mediante código QR</div>
      </div>

      {menuUrl && (
        <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl border border-[#E7DCD2] bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:gap-6">
          <div className="rounded-2xl border border-[#E7DCD2] bg-[#FFF6ED] p-3">
            {/* QR generado por un servicio externo sencillo */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                menuUrl
              )}`}
              alt="Código QR del menú"
              className="h-52 w-52"
            />
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Código QR del menú</p>
            <p>Escanéalo con la cámara del celular para abrir el menú digital.</p>
            <p className="mt-2 break-all text-xs text-slate-500">{menuUrl}</p>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-[#E7DCD2] bg-white px-4 py-3 shadow-sm">
        <span className="text-slate-400">🔍</span>
        <input
          placeholder="Buscar platos..."
          className="w-full bg-transparent text-slate-700 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const activeBtn = active === cat;
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeBtn
                  ? "bg-orange-500 text-white shadow"
                  : "bg-white text-slate-600 hover:bg-orange-50 border border-[#E7DCD2]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {error && <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600">{error}</div>}

      {loading ? (
        <p className="mt-6 text-slate-500">Cargando menú...</p>
      ) : (
        <div className="mt-6 space-y-4">
          {visibleItems.map((dish) => (
            <article
              key={dish.id}
              className="card flex flex-col gap-4 rounded-3xl border border-[#E7DCD2] bg-white p-4 md:flex-row"
            >
              <div className="relative h-32 w-full overflow-hidden rounded-2xl md:w-52">
                {dish.imageUrl ? (
                  <Image
                    src={
                      dish.imageUrl.startsWith("/uploads")
                        ? `${process.env.NEXT_PUBLIC_API_URL}${dish.imageUrl}`
                        : dish.imageUrl
                    }
                    alt={dish.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-slate-100 text-slate-400">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{dish.name}</h3>
                    <p className="text-slate-600">{dish.description}</p>
                  </div>
                  <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {dish.category?.name ?? "Sin categoría"}
                  </span>
                </div>
                <div className="text-lg font-semibold text-emerald-700">
                  {formatPrice(dish.price as number)}
                </div>
              </div>
            </article>
          ))}
          {visibleItems.length === 0 && <p className="text-slate-500">No hay platos visibles.</p>}
        </div>
      )}
    </section>
  );
}

