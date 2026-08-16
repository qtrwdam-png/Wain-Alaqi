import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

/**
 * Auto-index districts (neighborhoods) within a city using OpenStreetMap's
 * Overpass API. Given a city's lat/lng, we query for administrative and
 * named place nodes/ways in a bounding box around the city center.
 *
 * Results are best-effort: OSM coverage varies by region. The admin can
 * review and edit the fetched districts afterward.
 */

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
};

const OVERPASS_URLS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

const PLACE_TAGS = [
  "place=suburb",
  "place=neighbourhood",
  "place=quarter",
  "place=village",
  "place=hamlet",
  "place=town",
  "place=city_district",
];

/**
 * Fetch district names within a bounding box around the given coordinates.
 * Uses Overpass QL. Returns a deduplicated list of { name, lat, lng }.
 */
async function fetchDistrictsFromOSM(lat: number, lng: number, radiusKm = 15) {
  // Convert radius (km) to approximate degrees
  const deltaLat = radiusKm / 111;
  const deltaLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const south = lat - deltaLat;
  const west = lng - deltaLng;
  const north = lat + deltaLat;
  const east = lng + deltaLng;

  const bbox = `${south},${west},${north},${east}`;

  const nodeFilters = PLACE_TAGS.map((t) => `node["${t.split("=")[0]}"="${t.split("=")[1]}"](${bbox});`).join("");
  const wayFilters = PLACE_TAGS.map((t) => `way["${t.split("=")[0]}"="${t.split("=")[1]}"](${bbox});`).join("");

  const query = `[out:json][timeout:25];(${nodeFilters}${wayFilters});out center 80;`;

  let lastError: Error | null = null;
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "WainAlaqi/1.0 (wainalaqi.com)",
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!res.ok) {
        lastError = new Error(`Overpass ${url} returned ${res.status}`);
        continue;
      }

      const data = await res.json();
      const elements: OverpassElement[] = data.elements || [];

      const seen = new Set<string>();
      const districts: { name: string; lat: number; lng: number }[] = [];

      for (const el of elements) {
        const name = el.tags?.["name:ar"] || el.tags?.name || el.tags?.["name:en"];
        if (!name) continue;

        const key = name.trim().toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const elat = el.lat ?? (el as any).center?.lat;
        const elng = el.lon ?? (el as any).center?.lon;
        if (elat == null || elng == null) continue;

        districts.push({ name: name.trim(), lat: elat, lng: elng });
      }

      return districts;
    } catch (err) {
      lastError = err as Error;
      continue;
    }
  }

  throw lastError || new Error("All Overpass endpoints failed");
}

/**
 * Auto-index districts for a city. Fetches from OSM and creates District
 * records (skipping duplicates). Returns the created count and total found.
 */
export async function autoIndexDistricts(cityId: string) {
  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) throw new Error("City not found");

  const fetched = await fetchDistrictsFromOSM(city.latitude, city.longitude);

  let created = 0;
  for (const d of fetched) {
    const slug = slugify(d.name);
    try {
      await prisma.district.upsert({
        where: { cityId_slug: { cityId, slug } },
        update: { latitude: d.lat, longitude: d.lng },
        create: { name: d.name, slug, cityId, latitude: d.lat, longitude: d.lng },
      });
      created++;
    } catch {
      // skip on individual errors
    }
  }

  return { found: fetched.length, created };
}
