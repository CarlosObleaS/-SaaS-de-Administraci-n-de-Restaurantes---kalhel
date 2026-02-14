"use client";

import { formatPrice } from "@/lib/formatPrice";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

type Category = { id: string; name: string };

type Item = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  imageUrl?: string | null;
  isActive: boolean;
  categoryId?: string;
  category?: { name: string };
};

export default function CartaPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔹 NUEVO: estados para editar
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    categoryId: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/items`, {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error("No se pudieron cargar los platos");
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menu/categories`,
        {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        }
      );
      if (!res.ok) throw new Error("No se pudieron cargar las categorías");
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este plato?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/menu/items/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token ?? ""}` },
      }
    );
    if (res.ok) loadItems();
  };

  const handleToggle = async (id: string, active: boolean) => {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/menu/items/${id}/toggle`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ isActive: active }),
      }
    );
    if (res.ok) loadItems();
  };

  // 🔹 NUEVO: abrir modal editar
  const openEdit = (item: Item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      imageUrl: item.imageUrl ?? "",
      categoryId: item.categoryId ?? "",
    });
    setImageFile(null);
  };

  // 🔹 NUEVO: guardar cambios
  const handleUpdate = async () => {
    if (!editingItem) return;

    setSaving(true);
    setError(null);

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", String(Number(form.price)));
    if (form.categoryId) formData.append("categoryId", form.categoryId);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menu/items/${editingItem.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token ?? ""}` },
          body: formData,
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.message || "No se pudo actualizar el plato. Inténtalo de nuevo."
        );
        return;
      }

      setEditingItem(null);
      await loadItems();
    } catch (err: any) {
      setError(err.message || "Error al actualizar el plato");
    } finally {
      setSaving(false);
    }
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
          <h1 className="text-4xl font-bold text-slate-900">
            Gestión de Platos y Bebidas
          </h1>
          <p className="text-slate-500">Administra tu carta completa</p>
        </div>
        <div className="ml-auto">
          <Link
            href="/admin/carta/nuevo"
            className="rounded-xl bg-orange-500 px-4 py-2 text-white shadow hover:bg-orange-600"
          >
            + Agregar plato
          </Link>
        </div>
      </div>

      <div className="mb-8 flex items-center gap-3 rounded-xl border border-[#E7DCD2] bg-white px-4 py-3 shadow-sm">
        <span className="text-slate-400">🔍</span>
        <input
          placeholder="Buscar platos o categorías..."
          className="w-full bg-transparent text-slate-700 outline-none"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">Cargando platos...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((dish) => (
            <article
              key={dish.id}
              className={`card overflow-hidden rounded-3xl border border-[#E7DCD2] bg-white ${
                !dish.isActive ? "opacity-70" : ""
              }`}
            >
              <div className="relative h-52 w-full">
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

              <div className="space-y-2 p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {dish.name}
                  </h3>
                  {!dish.isActive && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                      Oculto
                    </span>
                  )}
                </div>

                <p className="text-slate-500">{dish.description}</p>

                <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {dish.category?.name ?? "Sin categoría"}
                </span>

                <div className="pt-1 text-lg font-semibold text-emerald-700">
                  {formatPrice(Number(dish.price))}
                </div>

                <div className="flex gap-2 pt-2 text-sm">
                  <button
                    className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
                    onClick={() => openEdit(dish)}
                  >
                    Editar
                  </button>

                  <button
                    className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
                    onClick={() => handleToggle(dish.id, !dish.isActive)}
                  >
                    {dish.isActive ? "Ocultar" : "Mostrar"}
                  </button>

                  <button
                    className="rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(dish.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 🔥 MODAL EDITAR */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-semibold">Editar plato</h2>

            <div className="space-y-3">
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Nombre"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
              <textarea
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Descripción"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <input
                type="number"
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Precio"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
              />
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Categoría
                  </label>
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
                    value={form.categoryId}
                    onChange={(e) =>
                      setForm({ ...form, categoryId: e.target.value })
                    }
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Imagen (archivo)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="mt-2 text-sm"
                    onChange={(e) =>
                      setImageFile(e.target.files?.[0] ?? null)
                    }
                  />
                  {form.imageUrl ? (
                    <p className="mt-2 text-xs text-slate-500">
                      Imagen actual: {form.imageUrl}
                    </p>
                  ) : null}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100"
                onClick={() => setEditingItem(null)}
              >
                Cancelar
              </button>
              <button
                className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:opacity-60"
                onClick={handleUpdate}
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


