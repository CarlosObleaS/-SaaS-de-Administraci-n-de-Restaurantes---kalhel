"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NuevaCategoriaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "No se pudo crear la categoría");
      }
      await res.json();
      router.push("/admin/categorias");
    } catch (err: any) {
      setError(err.message ?? "Error al guardar");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-slate-900">Agregar categoría</h1>
          <p className="text-slate-500">Crea una categoría para organizar tu carta.</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card space-y-5 rounded-3xl border border-[#E7DCD2] bg-white p-6"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Nombre de la categoría <span className="text-red-500">*</span>
          </label>
          <input
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:ring-2 focus:ring-orange-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Platos Principales"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            className="h-11 rounded-xl border border-slate-200 px-4 text-slate-700 hover:bg-slate-50"
            onClick={() => router.back()}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-xl bg-orange-500 px-5 font-medium text-white shadow hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar categoría"}
          </button>
        </div>
      </form>
    </section>
  );
}
