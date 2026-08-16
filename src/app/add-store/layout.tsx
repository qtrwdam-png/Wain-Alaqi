import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أضف متجرك في الرمثا",
  description:
    "أضف متجرك مجاناً إلى دليل وين ألاقي؟ واصل لعملاء الرمثا، الأردن — سجل متجرك وقطاعك وموقعك ووسائل التواصل.",
  alternates: { canonical: "/add-store" },
};

export default function AddStoreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
