"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Subscription = {
  status: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string | null;
  stripeSubId?: string | null;
};

const plans = [
  { id: "starter", name: "Starter", price: 19, features: ["50 pedidos/mes", "1 impresora"], periodDays: 30 },
  { id: "pro", name: "Pro", price: 39, features: ["Pedidos ilimitados", "2 impresoras", "Soporte"], periodDays: 30 },
  { id: "enterprise", name: "Enterprise", price: 79, features: ["Multisucursal", "Prioridad"], periodDays: 30 },
];

const providers = ["stripe", "paypal", "culqi"] as const;

export default function SuscripcionPage() {
  const router = useRouter();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selPlan, setSelPlan] = useState("pro");
  const [provider, setProvider] = useState<(typeof providers)[number]>("stripe");
  const [creating, setCreating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token") ?? "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("No se pudo cargar la suscripción");
      const data = await res.json();
      setSub(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const startCheckout = async () => {
    setCreating(true);
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem("token") ?? "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: selPlan, provider }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "No se pudo iniciar el pago");
      setMessage("Suscripción activada");
      setSub(data.subscription);
      if (data.paymentUrl) window.open(data.paymentUrl, "_blank");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const cancelSubscription = async () => {
    setCancelling(true);
    setError(null);
    setMessage(null);
    try {
      const token = localStorage.getItem("token") ?? "";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/cancel-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "No se pudo cancelar la suscripción");
      setMessage("Suscripción cancelada manualmente para pruebas");
      setSub(data.subscription);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(false);
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
          <h1 className="text-4xl font-bold text-slate-900">Suscripción</h1>
          <p className="text-slate-500">Elige tu plan y gestiona la facturación.</p>
        </div>
      </div>

      {sub && (
        <div className="mb-6 rounded-3xl border border-[#E7DCD2] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Estado actual</div>
              <div className="text-xl font-semibold text-slate-900">{sub.status}</div>
              {sub.currentPeriodEnd && (
                <div className="text-sm text-slate-500">
                  Vigente hasta {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                </div>
              )}
            </div>
            {sub.stripeSubId && (
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-700">{sub.stripeSubId}</span>
            )}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-4 flex justify-end">
            <button
              onClick={cancelSubscription}
              disabled={cancelling}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100 disabled:opacity-60"
            >
              {cancelling ? "Cancelando..." : "Cancelar suscripción (test)"}
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {providers.map((p) => (
          <button
            key={p}
            onClick={() => setProvider(p)}
            className={`rounded-full px-4 py-2 text-sm ${
              provider === p ? "bg-orange-500 text-white" : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-red-600">{error}</div>}
      {message && <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-emerald-700">{message}</div>}

      {loading ? (
        <p className="text-slate-500">Cargando planes...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`card rounded-3xl border ${
                selPlan === plan.id ? "border-orange-400 shadow-lg" : "border-[#E7DCD2]"
              } bg-white p-5 cursor-pointer`}
              onClick={() => setSelPlan(plan.id)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                <div className="text-2xl font-bold text-slate-900">${plan.price}</div>
              </div>
              <div className="text-sm text-slate-500">Mensual</div>
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              {selPlan === plan.id && (
                <div className="mt-4">
                  <button
                    className="h-11 w-full rounded-xl bg-orange-500 px-4 text-white hover:bg-orange-600 disabled:opacity-60"
                    onClick={startCheckout}
                    disabled={creating}
                  >
                    {creating ? "Procesando..." : `Elegir (${provider.toUpperCase()})`}
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
