import type { NextConfig } from "next";

const apiHost = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL).hostname
  : null;

const nextConfig: NextConfig = {
  output: "standalone",
  // Permite acceder al dev server desde otros dispositivos en la LAN (ej. celular)
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    // Ajusta la IP a la de tu PC en la red local si cambia
    "http://192.168.1.50:3000",
    "http://192.168.1.102:3000",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      // Backend local (uploads) para pruebas en LAN
      { protocol: "http", hostname: "localhost", port: "4000" },
      { protocol: "http", hostname: "127.0.0.1", port: "4000" },
      { protocol: "http", hostname: "192.168.1.50", port: "4000" },
      { protocol: "http", hostname: "192.168.1.102", port: "4000" },
      ...(apiHost
        ? [{ protocol: "http" as const, hostname: apiHost, port: "4000", pathname: "/**" }]
        : []),
    ],
  },
};

export default nextConfig;
