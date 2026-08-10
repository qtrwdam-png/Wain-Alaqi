import { prisma } from "./prisma";

/**
 * Content — abstraction for editable CMS content stored in DB.
 * Falls back to defaults if not found.
 */
const DEFAULTS: Record<string, any> = {
  home_hero: {
    title: "وين ألاقي؟",
    description: "ابحث عن المنتج أو الخدمة التي تحتاجها في الرمثا.",
  },
  home_banner: {
    title: "هل لديك متجر؟",
    description: "أضف متجرك مجانًا واصل لعملاء الرمثا.",
    cta_text: "أضف متجرك مجانًا",
    cta_url: "/add-store",
  },
  footer: {
    text: "منصة محلية للبحث عن المنتجات والخدمات والمتاجر في الرمثا، الأردن.",
  },
  about: {
    title: "عن المنصة",
    body: "وين ألاقي؟ منصة محلية تساعدك على العثور على المنتجات والخدمات والمتاجر في الرمثا، الأردن.",
  },
  faq: [
    { q: "كيف أبحث عن منتج؟", a: "اكتب اسم المنتج في مربع البحث واضغط بحث." },
    { q: "كيف أضيف متجري؟", a: "اضغط على «أضف متجرك» واملأ النموذج، وسيتم مراجعته من الإدارة." },
    { q: "هل التسجيل مجاني؟", a: "نعم، التسجيل وإضافة المتاجر مجاني تمامًا." },
  ],
  contact: {
    email: "info@wain-alaqi.test",
    phone: "+9620000000000",
  },
};

export const Content = {
  async get(key: string): Promise<any> {
    try {
      const row = await prisma.content.findUnique({ where: { key } });
      return row?.value ?? DEFAULTS[key] ?? null;
    } catch {
      return DEFAULTS[key] ?? null;
    }
  },
  async set(key: string, value: any) {
    return prisma.content.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  },
  async getAll(): Promise<Record<string, any>> {
    const rows = await prisma.content.findMany();
    const map: Record<string, any> = { ...DEFAULTS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  },
  getHomeHero() {
    return this.get("home_hero");
  },
};
