import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/**
 * POST /api/upload
 * Accepts multipart/form-data with a single file under the "file" field.
 * Returns { url } — the Cloudinary secure URL of the uploaded image.
 *
 * Auth required: any logged-in user (merchant uploading store/product images).
 * Size limit: 5MB, images only.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "يجب تسجيل الدخول لرفع الصور" }, { status: 401 });
    }

    if (!isCloudinaryConfigured) {
      return NextResponse.json({ error: "خدمة رفع الصور غير مُعدّة" }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "لم يتم إرسال ملف" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "الملف يجب أن يكون صورة" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "حجم الصورة يجب أن يكون أقل من 5 ميجابايت" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const folder = file.name?.includes("product") ? "wain-alaqi/products" : "wain-alaqi/stores";

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
          },
          (err, res) => {
            if (err || !res) reject(err || new Error("Upload failed"));
            else resolve({ secure_url: res.secure_url });
          },
        )
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (e: any) {
    logger.error("upload.failed", { error: e?.message || String(e), stack: e?.stack });
    return NextResponse.json({ error: "تعذّر رفع الصورة", detail: e?.message || String(e) }, { status: 500 });
  }
}
