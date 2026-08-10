export const APP_NAME = "وين ألاقي؟";
export const APP_NAME_EN = "Wain Alaqi";
export const APP_TAGLINE = "ابحث عن المنتج أو الخدمة التي تحتاجها في الرمثا";

export const CURRENCY = "JOD";
export const CURRENCY_LABEL = "د.أ";

export const ITEMS_PER_PAGE = 12;

export const DEFAULT_CITY_SLUG = process.env.NEXT_PUBLIC_DEFAULT_CITY || "al-ramtha";

// Store statuses
export const STORE_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
  "ARCHIVED",
] as const;

export const STORE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "مسودة",
  PENDING_REVIEW: "بانتظار المراجعة",
  APPROVED: "معتمد",
  REJECTED: "مرفوض",
  SUSPENDED: "موقوف",
  ARCHIVED: "مؤرشف",
};

export const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: "متوفر",
  LOW_STOCK: "كمية محدودة",
  OUT_OF_STOCK: "غير متوفر",
  UNKNOWN: "غير معروف",
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  VISIBLE: "ظاهر",
  HIDDEN: "مخفي",
  PENDING: "بانتظار المراجعة",
};

export const SEARCH_REQUEST_STATUS_LABELS: Record<string, string> = {
  NEW: "جديد",
  SEARCHING: "قيد البحث",
  FOUND: "تم الإيجاد",
  CLOSED: "مغلق",
};

export const ROLE_LABELS: Record<string, string> = {
  USER: "مستخدم",
  STORE_OWNER: "تاجر",
  ADMIN: "مدير",
  CONTENT_MANAGER: "محرر محتوى",
};
