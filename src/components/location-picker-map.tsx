"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { L: any }
}

// Center on Ar-Ramtha, Jordan
const RAMTHA_CENTER: [number, number] = [32.5569, 36.0042];

export function LocationPickerMap({
  latitude,
  longitude,
  onChange,
}: {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
      const startLat = latitude || RAMTHA_CENTER[0];
      const startLng = longitude || RAMTHA_CENTER[1];
      const map = L.map(ref.current).setView([startLat, startLng], 14);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on("dragend", () => {
        const ll = marker.getLatLng();
        setSaved(false);
        // keep marker, just mark unsaved
      });

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        setSaved(false);
      });
    }
    init().catch(console.error);
    return () => {
      cancelled = true;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync external changes if marker exists
  useEffect(() => {
    if (markerRef.current && latitude && longitude) {
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  async function search() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const q = encodeURIComponent(`${searchQuery} الرمثا الأردن`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`);
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (markerRef.current && mapRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.setView([lat, lng], 16);
        }
        onChange(lat, lng);
        setSaved(true);
      } else {
        setSearchError("لم يتم العثور على المكان. حاول البحث باسم أقرب معلم أو اسحب الدبوس يدوياً.");
      }
    } catch {
      setSearchError("تعذر البحث الآن. يمكنك سحب الدبوس يدوياً على الخريطة.");
    } finally {
      setSearching(false);
    }
  }

  function saveLocation() {
    if (markerRef.current) {
      const ll = markerRef.current.getLatLng();
      onChange(ll.lat, ll.lng);
      setSaved(true);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setSearchError("جهازك لا يدعم تحديد الموقع.");
      return;
    }
    setSearching(true);
    setSearchError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (markerRef.current && mapRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapRef.current.setView([lat, lng], 16);
        }
        onChange(lat, lng);
        setSaved(true);
        setSearching(false);
      },
      () => {
        setSearchError("تعذر تحديد موقعك. اسحب الدبوس يدوياً.");
        setSearching(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="input flex-1"
          placeholder="ابحث عن معلم أو اسم شارع…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); search(); } }}
        />
        <button type="button" onClick={search} disabled={searching} className="btn-secondary">
          {searching ? "جارٍ البحث…" : "🔍 بحث"}
        </button>
        <button type="button" onClick={useMyLocation} disabled={searching} className="btn-ghost">
          📍 موقعي الحالي
        </button>
      </div>

      <div ref={ref} style={{ height: 360, width: "100%" }} className="overflow-hidden rounded-lg border border-gray-200" />

      <div className="flex items-center gap-3">
        <button type="button" onClick={saveLocation} className="btn-primary">
          {saved ? "✓ تم حفظ الموقع" : "حفظ الموقع"}
        </button>
        {searchError && <p className="text-xs text-red-600">{searchError}</p>}
      </div>
    </div>
  );
}
