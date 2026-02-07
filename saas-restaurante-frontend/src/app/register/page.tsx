"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register-restaurant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantName, adminName, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "No se pudo registrar");
      }
      const data = await res.json();
      localStorage.setItem("token", data.token);
      if (data?.restaurant?.slug) {
        localStorage.setItem("restaurantSlug", data.restaurant.slug);
      }
      router.push("/admin");
    } catch (err: any) {
      setError(err.message ?? "Error al registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F3ED] p-6">
      <div className="w-full max-w-lg rounded-2xl border border-[#E7DCD2] bg-[#FFF8F0] p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-2xl text-white shadow-sm">
            🧾
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Registrar restaurante</h1>
          <p className="text-center text-sm text-slate-500">
            Crea tu cuenta administradora y comienza la prueba.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <Field label="Nombre del restaurante" value={restaurantName} onChange={setRestaurantName} required />
          <Field label="Tu nombre" value={adminName} onChange={setAdminName} required />
          <Field
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="correo@ejemplo.com"
            required
          />
          <Field label="Contraseña" type="password" value={password} onChange={setPassword} required />
          <Field label="Confirmar contraseña" type="password" value={confirm} onChange={setConfirm} required />

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <button
            disabled={loading}
            className="h-12 w-full rounded-xl bg-orange-500 font-medium text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </button>

          <button
            type="button"
            className="w-full text-center text-sm text-orange-600 hover:underline"
            onClick={() => router.push("/login")}
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 outline-none focus:ring-2 focus:ring-orange-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
