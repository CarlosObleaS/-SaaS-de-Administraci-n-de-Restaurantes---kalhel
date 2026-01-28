"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Credenciales inválidas");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token); // avance 1 (simple)
      router.push("/admin");
    } catch (err: any) {
      setError(err.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F3ED] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#FFF8F0] border border-[#E7DCD2] rounded-2xl shadow-sm p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-orange-400 flex items-center justify-center shadow-sm">
            <span className="text-white text-2xl">🍴</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-800">Iniciar sesión</h1>
          <p className="text-slate-500 text-sm text-center">
            Sistema de Administración de Restaurantes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              className="mt-2 w-full h-11 rounded-xl border border-slate-200 bg-white px-4 outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              className="mt-2 w-full h-11 rounded-xl border border-slate-200 bg-white px-4 outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full h-12 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <button
            type="button"
            className="w-full text-orange-600 text-sm hover:underline"
            onClick={() => router.push("/register")}
          >
            Registrar restaurante
          </button>
        </form>
      </div>
    </main>
  );
}
