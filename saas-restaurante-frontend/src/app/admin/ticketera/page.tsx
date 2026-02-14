"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/formatPrice";

export default function TicketeraPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setError(null);
        const token = localStorage.getItem("token") ?? "";
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/printer/tickets`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("No se pudieron cargar los tickets");
        const data = await res.json();
        setTickets(data);
      } catch (e: any) {
        setError(e?.message ?? "Error cargando tickets");
      }
    };

    fetchTickets();
    const interval = setInterval(fetchTickets, 2000); // 🔄 tiempo real simple

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pb-16">
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        🖨️ Ticketera
      </h1>

      {error && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {tickets.length === 0 && (
        <p className="mt-4 text-slate-500">Esperando pedidos…</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tickets.map((t: any) => (
          <div
            key={t.id}
            className="w-full rounded-2xl border bg-white p-4 font-mono shadow-sm"
          >
            <h2 className="text-center font-bold">
              {t.restaurant}
            </h2>
            <p>Mesa: {t.mesa}</p>
            <p>{t.fecha}</p>
            <hr className="my-2" />

            {t.items.map((i: any, idx: number) => (
              <p key={idx}>
                {i.qty} x {i.name}
              </p>
            ))}

            <hr className="my-2" />
            <p className="font-bold">
              TOTAL: {formatPrice(t.total)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}


