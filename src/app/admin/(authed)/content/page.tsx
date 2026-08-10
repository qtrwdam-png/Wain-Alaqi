import { Content } from "@/lib/content";
import { ContentEditorClient } from "@/components/content-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "إدارة المحتوى" };

export default async function AdminContentPage() {
  const content = await Content.getAll();
  return (
    <div>
      <h1 className="text-xl font-extrabold text-gray-900 sm:text-2xl">إدارة المحتوى</h1>
      <p className="mt-1 text-gray-500">عدّل النصوص الظاهرة في الموقع دون لمس الكود.</p>
      <ContentEditorClient content={content} />
    </div>
  );
}
