"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window { L: any }
}

export function StoreMap({ lat, lng, name, markers }: {
  lat: number;
  lng: number;
  name?: string;
  markers?: { lat: number; lng: number; name: string; slug: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (typeof window === "undefined") return;
      if (!window.L) {
        await new Promise<void>((resolve, reject) => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
          const s = document.createElement("script");
          s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          s.onload = () => resolve();
          s.onerror = () => reject(new Error("leaflet load failed"));
          document.head.appendChild(s);
        });
      }
      if (cancelled || !ref.current) return;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      const L = window.L;
      const map = L.map(ref.current).setView([lat, lng], 14);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      if (markers && markers.length) {
        markers.forEach((m) => {
          L.marker([m.lat, m.lng]).addTo(map).bindPopup(`<a href="/stores/${m.slug}">${m.name}</a>`);
        });
      } else {
        L.marker([lat, lng]).addTo(map).bindPopup(name || "");
      }
      setTimeout(() => map.invalidateSize(), 100);
    }
    init().catch(console.error);
    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [lat, lng, name, markers]);

  return <div ref={ref} style={{ height: 280, width: "100%" }} className="h-[280px] sm:h-[320px]" />;
}
