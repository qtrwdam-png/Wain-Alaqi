import { Content } from "@/lib/content";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "عن منصة وين ألاقي؟",
  description: "تعرف على منصة وين ألاقي؟ — دليل محلي للبحث عن المنتجات والخدمات والمتاجر في الرمثا، الأردن.",
  alternates: { canonical: "/about" },
};

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
    <div className="container-app py-8 sm:py-10">
      <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">{about.title || "عن المنصة"}</h1>
      <div className="mt-4 max-w-2xl text-gray-600">
        <p>{about.body}</p>
      </div>

      <div className="card mt-8 max-w-2xl p-5 sm:p-6">
        <h2 className="text-lg font-bold text-gray-800 sm:text-xl">مطور المنصة</h2>
        <p className="mt-2 leading-relaxed text-gray-600">
          مطوّر هذه المنصة <strong className="font-semibold text-gray-800">فايز محمد أبو العيلة</strong>، وهي منصة مجانية 100%.
        </p>
      </div>

      <div className="mt-8 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">لماذا تم تصميم هذه المنصة؟</h2>
        <div className="mt-4 space-y-3 leading-relaxed text-gray-600">
          <p>كم مرة دورت على شغلة وما عرفت وين ممكن تلاقيها؟</p>
          <p>بتسال هون، بتسال هناك، وبالاخر بتقضي وقتك تلف من محل لمحل، وممكن تكون الشغلة موجودة عند شخص قريب منك أصلاً.</p>
          <p>عشان هيك عملنا «وين ألاقي؟».</p>
          <p>الفكرة بسيطة جداً:</p>
          <p>أي شخص عنده غرض، منتج، قطعة جهاز، أو أي شيء حاب يعرضه، بقدر يضيفه على الموقع.</p>
          <p>
            سجّل كتاجر (بريد إلكتروني / الاسم / العنوان / رقم تلفون / واتساب)، هيك سجّلت انشر منتجك.
            وأي شخص بدوّر على شيء معين بكتب اسمه وبيشوف شو الموجود، واللي بعرضه مع السعر ومعلومات التواصل والموقع إذا كانت متوفرة.
          </p>
          <p>يعني سواء عندك محل وعندك منتجات، أو عندك غرض واحد بالبيت وحاب تبيعه — المكان الك.</p>
          <p>وحالياً انطلقنا من الرمثا، وبعدها الهدف إن شاء الله نوصل لمدن ومناطق أكثر.</p>
          <p>الموقع لسه جديد، وبدنا نبدأ بتجميع الأشياء اللي الناس فعلاً بتدوّر عليها.</p>
          <p>جرّب الموقع، وإذا عندك شيء حاب تعرضه ضيفه، الموضوع بسيط جداً، وإذا بتدوّر على شيء ابحث عنه.</p>
          <p className="pt-2">
            <a href="https://wainalaqi.com/" className="font-semibold text-brand-700 hover:underline">https://wainalaqi.com/</a>
          </p>
          <p className="text-lg font-bold text-gray-800">وين ألاقي؟ يمكن تلاقيها عندنا.</p>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold sm:text-2xl">الأسئلة الشائعة</h2>
      <div className="mt-4 max-w-2xl space-y-4">
        {(faq as { q: string; a: string }[]).map((f, i) => (
          <div key={i} className="card p-4 sm:p-5">
            <h3 className="font-bold text-gray-800">{f.q}</h3>
            <p className="mt-1 text-sm text-gray-600">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
