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
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/categories`, {
          headers: { Authorization: `Bearer ${token ?? ""}` },
        });
        if (!res.ok) throw new Error("No se pudieron cargar las categorías");
        const data = await res.json();
        setCategories(data);
        if (data.length > 0) setForm((f) => ({ ...f, categoryId: data[0].id }));
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
      const body = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId,
        imageUrl: form.imageUrl || null,
      };
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? ""}`,
        },
        body: JSON.stringify(body),
      });
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
          aria-label="Volver"
        >
          ←
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agregar plato</h1>
          <p className="text-slate-500">Completa la información del nuevo plato o bebida.</p>
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
          placeholder="Ej. Risotto de Hongos"
        />
        <Field
          label="Descripción"
          required
          value={form.description}
          onChange={(v) => handleChange("description", v)}
          placeholder="Describe ingredientes o preparación"
          multiline
        />
        <Field
          label="Precio (USD)"
          required
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(v) => handleChange("price", v)}
        />
        <Field
          label="Imagen (URL)"
          placeholder="https://..."
          value={form.imageUrl}
          onChange={(v) => handleChange("imageUrl", v)}
        />
        <FileField onLoaded={(dataUrl) => handleChange("imageUrl", dataUrl)} />

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none focus:ring-2 focus:ring-orange-300"
            value={form.categoryId}
            onChange={(e) => handleChange("categoryId", e.target.value)}
            required
            disabled={loadingCats || categories.length === 0}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {loadingCats && <p className="mt-1 text-sm text-slate-500">Cargando categorías...</p>}
          {!loadingCats && categories.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              No hay categorías. Crea una en “Categorías” antes de agregar platos.
            </p>
          )}
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
            disabled={submitting || categories.length === 0}
            className="h-11 rounded-xl bg-orange-500 px-5 font-medium text-white shadow hover:bg-orange-600 disabled:opacity-60"
          >
            {submitting ? "Guardando..." : "Guardar plato"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  multiline = false,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  min?: string;
  step?: string;
}) {
  const commonProps = {
    className:
      "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:ring-2 focus:ring-orange-300",
    required,
    placeholder,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea {...commonProps} rows={3} />
      ) : (
        <input {...commonProps} type={type} min={min} step={step} />
      )}
    </div>
  );
}

function FileField({ onLoaded }: { onLoaded: (dataUrl: string) => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  const handleFile = (file?: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        onLoaded(result); // data URL
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">Imagen (subir archivo)</label>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          className="text-sm text-slate-600"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {fileName && <span className="text-xs text-slate-500">{fileName}</span>}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Opcional: puedes subir un archivo o pegar un URL arriba. Si subes archivo, se enviará como base64.
      </p>
    </div>
  );
}
