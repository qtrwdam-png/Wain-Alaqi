import { Content } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "تواصل معنا" };

export default async function ContactPage() {
  const contact = await Content.get("contact");
  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-extrabold text-gray-900">تواصل معنا</h1>
      <div className="card mt-6 max-w-lg p-6">
        <p className="text-gray-600">لأي استفسار أو ملاحظة، تواصل معنا عبر:</p>
        <div className="mt-4 space-y-2 text-sm">
          <p>📧 {contact.email || "info@wain-alaqi.test"}</p>
          <p>📞 {contact.phone || "—"}</p>
        </div>
      </div>
    </div>
  );
}
