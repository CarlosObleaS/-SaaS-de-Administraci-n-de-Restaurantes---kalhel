"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MenuIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const storedSlug =
      typeof window !== "undefined"
        ? localStorage.getItem("restaurantSlug")
        : null;
    const envSlug = process.env.NEXT_PUBLIC_RESTAURANT_SLUG || null;
    const slug = storedSlug || envSlug;

    if (slug) {
      router.replace(`/menu/${slug}`);
      return;
    }

    router.replace("/");
  }, [router]);

  return (
    <main className="min-h-screen bg-[#FFF8F2] p-6">
      <p className="text-center text-slate-600">Abriendo menú...</p>
    </main>
  );
}

