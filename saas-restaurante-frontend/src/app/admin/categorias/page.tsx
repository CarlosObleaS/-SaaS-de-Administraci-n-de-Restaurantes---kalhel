"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = { id: string; name: string; _count?: { items: number } };

export default function CategoriasPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error("No se pudieron cargar las categorías");
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    if (res.ok) loadCategories();
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
          <h1 className="text-4xl font-bold text-slate-900">Gestión de Categorías</h1>
          <p className="text-slate-500">Organiza tu carta por categorías</p>
        </div>
        <div className="ml-auto">
          <Link
            href="/admin/categorias/nueva"
            className="rounded-xl bg-orange-500 px-4 py-2 text-white shadow hover:bg-orange-600"
          >
            + Agregar categoría
          </Link>
        </div>
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600">{error}</div>}
      {loading ? (
        <p className="text-slate-500">Cargando categorías...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categories.map((cat) => (
            <article
              key={cat.id}
              className="card flex items-center gap-4 rounded-3xl border border-[#E7DCD2] bg-white px-5 py-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-xl text-orange-600">
                🏷️
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-slate-900">{cat.name}</div>
                <div className="text-sm text-slate-500">
                  {(cat as any)._count?.items ?? 0} productos
                </div>
              </div>
              <button
                className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50 text-sm"
                onClick={() => handleDelete(cat.id)}
              >
                Eliminar
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
