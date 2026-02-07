"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  const params = useParams<{ slug: string }>();
  const [active, setActive] = useState("Todo");
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const slug =
          params?.slug ||
          process.env.NEXT_PUBLIC_RESTAURANT_SLUG ||
          "demo-resto";
        // Primero intenta con token (admin) para sincronizar con Gestión de Platos
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
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
            `No se pudo cargar el menú (${res.status}). Slug: ${slug}. URL: ${url}. ${body}`
          );
        }
        const data: PublicMenu = await res.json();
        const flat = data.categories.flatMap((c) =>
          c.items.map((i) => ({ ...i, category: { name: c.name } }))
        );
        setItems(flat);
      } catch (err: any) {
        setError(err?.message ?? "Error de red (Failed to fetch)");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [params?.slug]);

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
    <section className="min-h-screen bg-[#FFF8F2] pb-24">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="px-4 py-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900">Menú Digital</h1>
            <p className="text-sm text-slate-500">Escanea, elige y disfruta 🍽️</p>
        </div>

        {/* Buscador */}
        <div className="px-4 pb-3">
            <div className="flex items-center gap-3 rounded-full border bg-white px-4 py-2 shadow-sm">
            <span className="text-slate-400">🔍</span>
            <input
                placeholder="Buscar plato..."
                className="w-full bg-transparent text-sm outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>
        </div>

        {/* Categorías */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3">
            {categories.map((cat) => {
            const activeBtn = active === cat;
            return (
                <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                    activeBtn
                    ? "bg-orange-500 text-white shadow"
                    : "bg-white text-slate-600 border"
                }`}
                >
                {cat}
                </button>
            );
            })}
        </div>
        </header>

        {/* Estados */}
        <div className="px-4">
        {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">
            {error}
            </div>
        )}

        {loading ? (
            <p className="mt-6 text-center text-slate-500">Cargando menú...</p>
        ) : (
            <div className="mt-6 space-y-6">
            {visibleItems.map((dish) => (
                <article
                key={dish.id}
                className="overflow-hidden rounded-3xl bg-white shadow"
                >
                {/* Imagen */}
                <div className="relative h-44 w-full bg-slate-100">
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
                    <div className="flex h-full items-center justify-center text-slate-400">
                        Sin imagen
                    </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-4">
                    <div className="mb-1 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                        {dish.name}
                    </h3>
                    <span className="text-lg font-bold text-emerald-600">
                        ${formatPrice(dish.price as any)}
                    </span>
                    </div>

                    <p className="text-sm text-slate-600">
                    {dish.description}
                    </p>

                    {dish.category?.name && (
                    <div className="mt-2">
                        <span className="inline-block rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                        {dish.category.name}
                        </span>
                    </div>
                    )}
                </div>
                </article>
            ))}

            {visibleItems.length === 0 && (
                <p className="text-center text-slate-500">
                No hay platos disponibles
                </p>
            )}
            </div>
        )}
        </div>
    </section>
    );
}

function formatPrice(price: number | string | null | undefined) {
  const n = Number(price);
  if (Number.isFinite(n)) return n.toFixed(2);
  return price ?? "";
}
