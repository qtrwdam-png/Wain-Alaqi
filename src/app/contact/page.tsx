import { Content } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "تواصل معنا",
  description: "تواصل مع منصة وين ألاقي؟ — لأي استفسار أو ملاحظة أو لإضافة متجرك في الرمثا، الأردن.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  let contact: any = { email: "info@wain-alaqi.test", phone: "—" };
  try {
    contact = await Content.get("contact");
  } catch {
    // DB not ready
  }
  return (
    <div className="container-app py-8 sm:py-10">
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">تواصل معنا</h1>
      <div className="card mt-6 max-w-lg p-5 sm:p-6">
        <p className="text-gray-600">لأي استفسار أو ملاحظة، تواصل معنا عبر:</p>
        <div className="mt-4 space-y-2 text-sm">
          <p className="break-all">📧 {contact.email || "info@wain-alaqi.test"}</p>
          <p dir="ltr" className="text-right">📞 {contact.phone || "—"}</p>
        </div>
      </div>
    </div>
  );
}
