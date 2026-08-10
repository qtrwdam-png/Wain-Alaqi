"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: "2rem", background: "#f8faf9", color: "#0f1a14", textAlign: "center" }}>
        <div style={{ maxWidth: "500px", margin: "10vh auto" }}>
          <div style={{ fontSize: "3rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>حدث خطأ في التطبيق</h1>
          <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>عذراً، حدث خطأ غير متوقع. حاول مرة أخرى.</p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 1.5rem",
              background: "#1d7a40",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
