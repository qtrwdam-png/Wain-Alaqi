import { SITE_URL, SITE_NAME_AR, SITE_NAME_EN, SITE_TAGLINE, SITE_GEO, absoluteUrl } from "@/lib/site";

// JSON-LD <script> for structured data. Rendered server-side; Google reads it
// directly from the HTML without executing JS.

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// WebSite schema with SearchAction — enables Google sitelinks search box.
export function WebSiteSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME_AR,
        alternateName: [SITE_NAME_EN, "وين الاقي", "وين الا قي", "وينألاقي", "Wain Alaqi", "Wain Alaqi?"],
        description: SITE_TAGLINE,
        inLanguage: "ar-JO",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        publisher: { "@id": `${SITE_URL}/#organization` },
      }}
    />
  );
}

// Organization schema — defines the platform entity.
export function OrganizationSchema() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME_AR,
        alternateName: [SITE_NAME_EN, "وين الاقي", "وين الا قي", "وينألاقي", "Wain Alaqi", "Wain Alaqi?"],
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/logo.png"),
        },
        description: SITE_TAGLINE,
        founder: {
          "@type": "Person",
          name: "فايز أبو العيلة",
          alternateName: ["فايز محمد", "Fayiz Abu Alaila", "Fayiz Mohammad", "Fayiz"],
          jobTitle: "مطوّر برمجيات",
        },
        areaServed: {
          "@type": "City",
          name: SITE_GEO.addressLocality,
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: SITE_GEO.addressLocality,
          addressRegion: SITE_GEO.addressRegion,
          addressCountry: SITE_GEO.addressCountry,
        },
      }}
    />
  );
}

// BreadcrumbList schema for navigation context.
export function BreadcrumbSchema({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          item: absoluteUrl(it.path),
        })),
      }}
    />
  );
}

// LocalBusiness schema for an individual store page.
export function LocalBusinessSchema({
  store,
}: {
  store: {
    name: string;
    slug: string;
    description?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    logo?: string | null;
    coverImage?: string | null;
    rating?: number;
    reviewCount?: number;
    category?: { name: string } | null;
    city?: { name?: string | null } | null;
    owner?: { name?: string | null } | null;
    alternateNames?: string[];
  };
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": absoluteUrl(`/stores/${store.slug}`),
    name: store.name,
    url: absoluteUrl(`/stores/${store.slug}`),
    image: store.coverImage || store.logo || absoluteUrl("/logo.png"),
    priceRange: "₋",
    address: {
      "@type": "PostalAddress",
      streetAddress: store.address || undefined,
      addressLocality: store.city?.name || SITE_GEO.addressLocality,
      addressRegion: SITE_GEO.addressRegion,
      addressCountry: SITE_GEO.addressCountry,
    },
    areaServed: SITE_GEO.addressLocality,
  };

  if (store.description) data.description = store.description;
  if (store.phone) data.telephone = store.phone;
  if (store.whatsapp) data.contactPoint = {
    "@type": "ContactPoint",
    contactType: "customer service",
    contactOption: "WhatsApp",
    identifier: store.whatsapp,
  };
  if (store.category?.name) {
    data["@type"] = ["LocalBusiness", "Store"];
    data.category = store.category.name;
    // helps match "category in city" style queries
    data.knowsAbout = [store.category.name, `${store.category.name} في ${store.city?.name || SITE_GEO.addressLocality}`];
  }
  if (store.logo) data.logo = store.logo;
  if (store.alternateNames && store.alternateNames.length) {
    data.alternateName = store.alternateNames;
  }
  const ownerName = store.owner?.name?.trim();
  if (ownerName && !ownerName.includes("@")) {
    data.founder = { "@type": "Person", name: ownerName };
  }
  if (typeof store.latitude === "number" && typeof store.longitude === "number") {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: store.latitude,
      longitude: store.longitude,
    };
  }
  if (typeof store.rating === "number" && store.rating > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: store.rating,
      reviewCount: store.reviewCount || 0,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return <JsonLd data={data} />;
}

// ItemList schema for a collection of stores/products (listing pages).
export function ItemListSchema({
  name,
  items,
}: {
  name: string;
  items: { name: string; path: string }[];
}) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: items.length,
        itemListElement: items.map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.name,
          url: absoluteUrl(it.path),
        })),
      }}
    />
  );
}
