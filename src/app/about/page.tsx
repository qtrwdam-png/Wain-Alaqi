import { Content } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = { title: "عن المنصة", description: "نبذة عن منصة وين ألاقي؟" };

export default async function AboutPage() {
  let about: any = { title: "عن المنصة", body: "وين ألاقي؟ منصة محلية تساعدك على العثور على المنتجات والخدمات والمتاجر في الرمثا، الأردن." };
  let faq: any = [];
  try {
    about = await Content.get("about");
    faq = await Content.get("faq");
  } catch {
    // DB not ready
  }
  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-extrabold text-gray-900">{about.title || "عن المنصة"}</h1>
      <div className="mt-4 max-w-2xl text-gray-600">
        <p>{about.body}</p>
      </div>

      <h2 className="mt-12 text-2xl font-bold">الأسئلة الشائعة</h2>
      <div className="mt-4 max-w-2xl space-y-4">
        {(faq as { q: string; a: string }[]).map((f, i) => (
          <div key={i} className="card p-5">
            <h3 className="font-bold text-gray-800">{f.q}</h3>
            <p className="mt-1 text-sm text-gray-600">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
