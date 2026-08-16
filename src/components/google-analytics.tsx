import { headers } from "next/headers";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

/**
 * Google Analytics (gtag.js) — server-rendered into the HTML so Google's
 * tag detector (which scans raw HTML for the gtag URL / measurement ID)
 * can find it. The CSP uses `'strict-dynamic'`, which disables host-based
 * allowlisting, so BOTH scripts must carry the middleware nonce to load.
 */
export async function GoogleAnalytics() {
  if (!GA_ID) return null;

  let nonce = "";
  try {
    nonce = (await headers()).get("x-nonce") || "";
  } catch {
    // headers() unavailable — render without nonce (CSP may block).
  }

  return (
    <>
      <script
        async
        nonce={nonce}
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
        }}
      />
    </>
  );
}
