"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };

export default function NuevoPlatoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
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
        if (data.length > 0) {
          setForm((f) => ({ ...f, categoryId: data[0].id }));
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoadingCats(false);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // 🔑 FormData para subir archivo
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("categoryId", form.categoryId);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/menu/items`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "No se pudo crear el plato");
      }

      await res.json();
      router.push("/admin/carta");
    } catch (err: any) {
      setError(err.message ?? "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pb-16">
      <div className="mb-6 flex items-center gap-3">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow"
          onClick={() => router.back()}
        >
          ←
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Agregar plato
          </h1>
          <p className="text-slate-500">
            Completa la información del nuevo plato o bebida.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card space-y-5 rounded-3xl border border-[#E7DCD2] bg-white p-6"
      >
        <Field
          label="Nombre"
          required
          value={form.name}
          onChange={(v) => handleChange("name", v)}
        />

        <Field
          label="Descripción"
          required
          multiline
          value={form.description}
          onChange={(v) => handleChange("description", v)}
        />

        <Field
          label="Precio"
          type="number"
          required
          value={form.price}
          onChange={(v) => handleChange("price", v)}
        />

        {/* 📷 SUBIR IMAGEN */}
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
        </div>

        {/* CATEGORÍA */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
            value={form.categoryId}
            onChange={(e) =>
              handleChange("categoryId", e.target.value)
            }
            required
            disabled={loadingCats}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-11 rounded-xl border px-4"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-xl bg-orange-500 px-5 text-white"
          >
            {submitting ? "Guardando..." : "Guardar plato"}
          </button>
        </div>
      </form>
    </section>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  multiline?: boolean;
};

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
  multiline = false,
}: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && "*"}
      </label>

      {multiline ? (
        <textarea
          className="mt-2 w-full rounded-xl border px-4"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          className="mt-2 h-11 w-full rounded-xl border px-4"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
