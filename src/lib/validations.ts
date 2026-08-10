import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z.string().optional(),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export const storeRegistrationSchema = z.object({
  // store
  storeName: z.string().min(2, "اسم المتجر مطلوب"),
  categoryId: z.string().min(1, "القطاع مطلوب"),
  cityId: z.string().min(1, "المدينة مطلوبة"),
  description: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().min(3, "العنوان مطلوب"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  openingHours: z.string().optional(),
  // owner
  ownerName: z.string().min(2, "اسم المالك مطلوب"),
  ownerEmail: z.string().email("بريد إلكتروني غير صالح"),
  ownerPhone: z.string().optional(),
  ownerPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export const productSchema = z.object({
  name: z.string().min(2, "اسم المنتج مطلوب"),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, "السعر غير صالح").optional(),
  availability: z.enum(["AVAILABLE", "LOW_STOCK", "OUT_OF_STOCK", "UNKNOWN"]),
  image: z.string().optional(),
  active: z.boolean().default(true),
});

export const searchRequestSchema = z.object({
  query: z.string().min(2, "ما الذي تبحث عنه؟"),
  notes: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("بريد غير صالح").or(z.literal("")).optional(),
});

export const reviewSchema = z.object({
  storeId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});
