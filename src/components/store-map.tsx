"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export function StoreMap({ lat, lng, name, markers }: {
  lat: number;
  lng: number;
  name?: string;
  markers?: { lat: number; lng: number; name: string; slug: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;

    import("leaflet").then(async (Lmod) => {
      const L = Lmod.default;
      // Fix default marker icon paths broken by bundling (Leaflet looks up relative URLs).
      const markerIcon = await import("leaflet/dist/images/marker-icon.png");
      const markerIcon2x = await import("leaflet/dist/images/marker-icon-2x.png");
      const markerShadow = await import("leaflet/dist/images/marker-shadow.png");
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x.default.src,
        iconUrl: markerIcon.default.src,
        shadowUrl: markerShadow.default.src,
      });
      if (cancelled || !ref.current) return;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
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
    }).catch(console.error);

    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [lat, lng, name, markers]);

  return <div ref={ref} style={{ height: 280, width: "100%" }} className="h-[280px] sm:h-[320px]" />;
}
