/**
 * Wain Alaqi — Seed script
 * Creates demo data: admin, store owners, city, 10 categories, ~40 stores, ~150 products, reviews, content.
 * Run with: npm run db:seed
 *
 * All data is marked is_demo = true. Admin can delete demo data.
 */
import { PrismaClient, Role, StoreStatus, Availability, ReviewStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "ChangeMe123!";
const RAMTHA = { lat: 32.5569, lng: 36.0069 };

// small jitter around Ramtha center for realistic spread
function near(base: number, delta = 0.01) {
  return +(base + (Math.random() - 0.5) * delta).toFixed(6);
}

const CATEGORIES: { name: string; slug: string; description: string; icon: string; sortOrder: number }[] = [
  { name: "الإلكترونيات والهواتف", slug: "electronics", description: "هواتف وحواسيب وإكسسوارات إلكترونية", icon: "📱", sortOrder: 1 },
  { name: "قطع السيارات ومستلزماتها", slug: "auto-parts", description: "قطع غيار ومستلزمات السيارات", icon: "🚗", sortOrder: 2 },
  { name: "الأدوات المنزلية", slug: "home-tools", description: "أدوات وأجهزة منزلية", icon: "🏠", sortOrder: 3 },
  { name: "مواد البناء والدهانات", slug: "building-materials", description: "مواد بناء ودهانات وأدوات", icon: "🧱", sortOrder: 4 },
  { name: "الكهرباء والإنارة", slug: "electrical", description: "أدوات كهربائية وإنارة", icon: "💡", sortOrder: 5 },
  { name: "الملابس والأحذية", slug: "fashion", description: "ملابس وأحذية للرجال والنساء", icon: "👕", sortOrder: 6 },
  { name: "المطاعم والمخابز", slug: "food", description: "مطاعم ومخابز وحلويات", icon: "🍽️", sortOrder: 7 },
  { name: "الصيدليات والمستلزمات الطبية", slug: "pharmacy", description: "أدوية ومستلزمات طبية", icon: "💊", sortOrder: 8 },
  { name: "الأثاث والمفروشات", slug: "furniture", description: "أثاث ومفروشات منزلية", icon: "🛋️", sortOrder: 9 },
  { name: "الخدمات والصيانة", slug: "services", description: "خدمات وصيانة متنوعة", icon: "🛠️", sortOrder: 10 },
];

// stores per category (demo names, not real businesses)
const STORES_BY_CAT: Record<string, { name: string; desc: string; featured?: boolean }[]> = {
  electronics: [
    { name: "متجر الرمثا للإلكترونيات", desc: "هواتف ذكية وحواسيب وإكسسوارات", featured: true },
    { name: "عالم التقنية", desc: "أحدث الهواتف والإكسسوارات الأصلية" },
    { name: "مركز الهاتف الحديث", desc: "بيع وصيانة الهواتف الذكية" },
    { name: "تك ستور الرمثا", desc: "حواسيب وقطع وألعاب" },
  ],
  "auto-parts": [
    { name: "مركز النخبة للسيارات", desc: "قطع غيار سيارات أصلية ومستعملة", featured: true },
    { name: "عالم قطع الغيار", desc: "قطع غيار لجميع الموديلات" },
    { name: "مركز الشام لقطع السيارات", desc: "مستلزمات وزيوت وفلاتر" },
    { name: "كراج الرمثا الحديث", desc: "صيانة وقطع غيار" },
  ],
  "home-tools": [
    { name: "البيت العصري", desc: "أدوات وأجهزة منزلية", featured: true },
    { name: "مركز الأدوات المنزلية", desc: "أدوات مطبخ وترتيب منزلي" },
    { name: "متجر ركن البيت", desc: "أجهزة صغيرة وكبيرة" },
  ],
  "building-materials": [
    { name: "مركز البناء الحديث", desc: "مواد بناء ودهانات", featured: true },
    { name: "معرض الدهانات الحديثة", desc: "دهانات وأدوات طلاء" },
    { name: "مؤسسة الرمثا للمواد", desc: "إسمنت ورمل وحديد" },
    { name: "مركز السيراميك والبورسلين", desc: "بلاط وسيراميك" },
  ],
  electrical: [
    { name: "مركز الكهرباء والإنارة", desc: "أدوات كهربائية وإنارة", featured: true },
    { name: "بيت الأنوار", desc: "إضاءة ديكورية وعملية" },
    { name: "متجر الأسلاك والكهرباء", desc: "أسلاك ومفاتيح ولوازم" },
  ],
  fashion: [
    { name: "بوتيك الرمثا", desc: "ملابس رجالية وحريمي", featured: true },
    { name: "موضة سنتر", desc: "أزياء عصرية" },
    { name: "عالم الأحذية", desc: "أحذية رجالية ونسائية" },
    { name: "متجر الأناقة", desc: "ملابس وإكسسوارات" },
  ],
  food: [
    { name: "مخبز الرمثا", desc: "خبز طازج ومعجنات", featured: true },
    { name: "مطعم الذواقة", desc: "وجبات شرقية وغربية" },
    { name: "حلويات الشام", desc: "حلويات وكعك" },
    { name: "مأكولات البيت", desc: "وجبات منزلية" },
  ],
  pharmacy: [
    { name: "صيدلية الرمثا", desc: "أدوية ومستلزمات طبية", featured: true },
    { name: "صيدلية الشفاء", desc: "أدوية ومكملات" },
    { name: "صيدلية النخبة", desc: "مستلزمات أطفال وعناية" },
  ],
  furniture: [
    { name: "معرض الأثاث الحديث", desc: "أثاث منزلي ومكتبي", featured: true },
    { name: "مفروشات الرمثا", desc: "أسرّة وكنب وطاولات" },
    { name: "ركن المفروشات", desc: "ستائر وسجاد ومفروشات" },
  ],
  services: [
    { name: "مركز الخدمات المنزلية", desc: "سباكة وكهرباء وصيانة", featured: true },
    { name: "خدمات الصيانة السريعة", desc: "صيانة أجهزة منزلية" },
    { name: "ورشة الألمنيوم والزجاج", desc: "ألمنيوم وزجاج وشرائح" },
    { name: "مركز تنظيف ومكافحة حشرات", desc: "تنظيف ومكافحة آفات" },
  ],
};

const PRODUCTS_BY_CAT: Record<string, { name: string; price: number; availability: Availability }[]> = {
  electronics: [
    { name: "شاحن آيفون 20 واط", price: 12.5, availability: "AVAILABLE" },
    { name: "شاحن سامسونج فائق السرعة 25 واط", price: 15.0, availability: "AVAILABLE" },
    { name: "سماعة بلوتوث لاسلكية", price: 18.0, availability: "LOW_STOCK" },
    { name: "كابل شحن Type-C أصلي", price: 4.5, availability: "AVAILABLE" },
    { name: "باور بانك 20000 ميلي أمبير", price: 22.0, availability: "AVAILABLE" },
    { name: "حامل جوال للسيارة", price: 6.0, availability: "OUT_OF_STOCK" },
    { name: "شاشة حماية آيفون 13", price: 3.5, availability: "AVAILABLE" },
    { name: "ماوس لاسلكي", price: 8.0, availability: "LOW_STOCK" },
  ],
  "auto-parts": [
    { name: "بطارية كيا سيراتو", price: 75.0, availability: "AVAILABLE" },
    { name: "بطارية تويوتا كورولا", price: 70.0, availability: "AVAILABLE" },
    { name: "فلتر زيت تويوتا", price: 5.0, availability: "AVAILABLE" },
    { name: "فلتر هواء هيونداي", price: 7.5, availability: "LOW_STOCK" },
    { name: "مساحات أمامية كيا", price: 9.0, availability: "AVAILABLE" },
    { name: "شمعة احتراق NGK", price: 3.5, availability: "AVAILABLE" },
    { name: "زيت محرك 5W-30", price: 18.0, availability: "AVAILABLE" },
    { name: "طقم فحمات أمامية", price: 25.0, availability: "OUT_OF_STOCK" },
  ],
  "home-tools": [
    { name: "خلاط يدوي", price: 14.0, availability: "AVAILABLE" },
    { name: "مقلاة هوائية", price: 45.0, availability: "LOW_STOCK" },
    { name: "مكنسة كهربائية", price: 55.0, availability: "AVAILABLE" },
    { name: "طقم قدور ستانلس", price: 35.0, availability: "AVAILABLE" },
    { name: "ميكروويف 20 لتر", price: 60.0, availability: "OUT_OF_STOCK" },
  ],
  "building-materials": [
    { name: "كيس إسمنت 50 كغم", price: 5.5, availability: "AVAILABLE" },
    { name: "دهان جدران أبيض 20 لتر", price: 22.0, availability: "AVAILABLE" },
    { name: "لفة سيراميك أرضيات", price: 12.0, availability: "LOW_STOCK" },
    { name: "أسلاك حديد تسليح", price: 30.0, availability: "AVAILABLE" },
    { name: "رولة فرش دهان", price: 1.5, availability: "AVAILABLE" },
  ],
  electrical: [
    { name: "لمبة LED 12 واط", price: 1.5, availability: "AVAILABLE" },
    { name: "كشاف سقف LED", price: 12.0, availability: "AVAILABLE" },
    { name: "فيش وكهبلة 3 متر", price: 4.0, availability: "LOW_STOCK" },
    { name: "مفتاح كهرباء مزدوج", price: 2.5, availability: "AVAILABLE" },
    { name: "لمبة ديكور ذكية", price: 8.0, availability: "OUT_OF_STOCK" },
  ],
  fashion: [
    { name: "قميص رجالي قطن", price: 12.0, availability: "AVAILABLE" },
    { name: "حذاء رياضي", price: 25.0, availability: "LOW_STOCK" },
    { name: "بنطلون جينز", price: 18.0, availability: "AVAILABLE" },
    { name: "حقيبة يد نسائية", price: 15.0, availability: "AVAILABLE" },
    { name: "جاكيت شتوي", price: 35.0, availability: "OUT_OF_STOCK" },
  ],
  food: [
    { name: "خبز عربي (ربطة)", price: 0.3, availability: "AVAILABLE" },
    { name: "مناقيش زعتر", price: 0.5, availability: "AVAILABLE" },
    { name: "وجبة شاورما دجاج", price: 1.5, availability: "AVAILABLE" },
    { name: "كيلو حلويات مشكلة", price: 6.0, availability: "LOW_STOCK" },
    { name: "بيتza وسط", price: 3.5, availability: "AVAILABLE" },
  ],
  pharmacy: [
    { name: "كمامات طبية 50 حبة", price: 2.0, availability: "AVAILABLE" },
    { name: "ميزان حرارة رقمي", price: 5.0, availability: "AVAILABLE" },
    { name: "فيتامين C 1000mg", price: 4.5, availability: "LOW_STOCK" },
    { name: "ضغط دم رقمي", price: 35.0, availability: "AVAILABLE" },
    { name: "مطهر يدين", price: 1.5, availability: "AVAILABLE" },
  ],
  furniture: [
    { name: "كنب 3 مقاعد", price: 250.0, availability: "AVAILABLE" },
    { name: "سرير كينغ", price: 180.0, availability: "LOW_STOCK" },
    { name: "طاولة طعام 6 أشخاص", price: 120.0, availability: "AVAILABLE" },
    { name: "خزانة ملابس 4 باب", price: 150.0, availability: "OUT_OF_STOCK" },
  ],
  services: [
    { name: "خدمة سباكة منزلية", price: 15.0, availability: "AVAILABLE" },
    { name: "صيانة غسالة", price: 20.0, availability: "AVAILABLE" },
    { name: "تركيب زجاج شباك", price: 25.0, availability: "LOW_STOCK" },
    { name: "تنظيف منزل كامل", price: 30.0, availability: "AVAILABLE" },
    { name: "كشف تسرب مياه", price: 18.0, availability: "AVAILABLE" },
  ],
};

function slugify(input: string): string {
  return input.toString().trim().toLowerCase().replace(/[^\w\u0600-\u06FF\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("🌱 Seeding Wain Alaqi demo data...");

  // City
  const city = await prisma.city.upsert({
    where: { slug: "al-ramtha" },
    update: {},
    create: { name: "الرمثا", slug: "al-ramtha", country: "الأردن", latitude: RAMTHA.lat, longitude: RAMTHA.lng, active: true },
  });

  // Users
  const hash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { name: "مدير المنصة", email: "admin@example.com", passwordHash: hash, role: "ADMIN" as Role, isDemo: true },
  });

  // store owners
  const owners = [];
  let ownerIdx = 1;
  for (const cat of CATEGORIES) {
    const stores = STORES_BY_CAT[cat.slug] || [];
    for (let i = 0; i < stores.length; i++) {
      const email = `store${ownerIdx}@example.com`;
      const owner = await prisma.user.upsert({
        where: { email },
        update: {},
        create: { name: `تاجر ${ownerIdx}`, email, passwordHash: hash, role: "STORE_OWNER" as Role, phone: `+9627900000${String(ownerIdx).padStart(2, "0")}`, isDemo: true },
      });
      owners.push({ owner, catSlug: cat.slug, storeInfo: stores[i] });
      ownerIdx++;
    }
  }

  // Categories
  const catMap: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, icon: c.icon, sortOrder: c.sortOrder },
      create: c,
    });
    catMap[c.slug] = cat.id;
  }

  // Stores + Products
  let storeCount = 0, productCount = 0;
  // one pending store + one rejected store for demo
  let storeSeedIdx = 0;
  for (const { owner, catSlug, storeInfo } of owners) {
    storeSeedIdx++;
    const status: StoreStatus = storeSeedIdx === 1 ? "PENDING_REVIEW" : storeSeedIdx === 2 ? "REJECTED" : "APPROVED";
    const verified = status === "APPROVED" && Math.random() > 0.4;
    let slug = slugify(storeInfo.name);
    let n = 1;
    while (await prisma.store.findUnique({ where: { slug } })) slug = `${slugify(storeInfo.name)}-${n++}`;

    const store = await prisma.store.create({
      data: {
        name: storeInfo.name,
        slug,
        description: storeInfo.desc,
        categoryId: catMap[catSlug],
        ownerId: owner.id,
        cityId: city.id,
        phone: owner.phone || "+962790000000",
        whatsapp: owner.phone || "+962790000000",
        address: `الرمثا - شارع ${storeSeedIdx}`,
        latitude: near(RAMTHA.lat),
        longitude: near(RAMTHA.lng),
        openingHours: { text: "السبت-الخميس: 9 صباحاً - 9 مساءً" },
        status,
        verified,
        isDemo: true,
        isFeatured: !!storeInfo.featured && status === "APPROVED",
        rejectionReason: status === "REJECTED" ? "يرجى إضافة عنوان واضح للمتجر وصورة شعار." : null,
        views: Math.floor(Math.random() * 500),
      },
    });
    storeCount++;

    const products = PRODUCTS_BY_CAT[catSlug] || [];
    for (const p of products) {
      let pslug = slugify(p.name);
      let pn = 1;
      while (await prisma.product.findFirst({ where: { storeId: store.id, slug: pslug } })) pslug = `${slugify(p.name)}-${pn++}`;
      await prisma.product.create({
        data: {
          storeId: store.id,
          categoryId: catMap[catSlug],
          name: p.name,
          slug: pslug,
          price: p.price,
          currency: "JOD",
          availability: p.availability,
          active: status === "APPROVED",
          isDemo: true,
        },
      });
      productCount++;
    }
  }

  // Demo users
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: { name: "مستخدم تجريبي", email: "user@example.com", passwordHash: hash, role: "USER" as Role, isDemo: true },
  });

  // Reviews on some approved stores
  const approvedStores = await prisma.store.findMany({ where: { status: "APPROVED" }, take: 10 });
  let reviewCount = 0;
  for (const s of approvedStores) {
    const numReviews = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numReviews; i++) {
      const rating = 3 + Math.floor(Math.random() * 3);
      try {
        await prisma.review.create({
          data: { storeId: s.id, userId: user.id, rating, comment: ["تجربة ممتازة", "خدمة جيدة", "أسعار مناسبة", "أنصح به"][i % 4], status: "VISIBLE" as ReviewStatus },
        });
        reviewCount++;
      } catch {
        // unique constraint on [storeId, userId] — only one review per user per store
      }
    }
    // recompute store rating
    const agg = await prisma.review.aggregate({ where: { storeId: s.id, status: "VISIBLE" }, _avg: { rating: true }, _count: { rating: true } });
    await prisma.store.update({ where: { id: s.id }, data: { rating: agg._avg.rating || 0, reviewCount: agg._count.rating } });
  }

  // Content defaults
  const contentDefaults: Record<string, any> = {
    home_hero: { title: "وين ألاقي؟", description: "ابحث عن المنتج أو الخدمة التي تحتاجها في الرمثا.", location: "📍 الرمثا، الأردن" },
    home_banner: { title: "هل لديك متجر؟", description: "أضف متجرك مجانًا واصل لعملاء الرمثا.", cta_text: "أضف متجرك مجانًا", cta_url: "/add-store" },
    popular_searches: ["بطارية كيا سيراتو", "شاحن آيفون 20 واط", "بطارية تويوتا", "سباك", "دهان جدران", "خلاط يدوي"],
    footer: { text: "منصة محلية للبحث عن المنتجات والخدمات والمتاجر في الرمثا، الأردن." },
    about: { title: "عن المنصة", body: "وين ألاقي؟ منصة محلية تساعدك على العثور على المنتجات والخدمات والمتاجر في الرمثا، الأردن." },
    faq: [
      { q: "كيف أبحث عن منتج؟", a: "اكتب اسم المنتج في مربع البحث واضغط بحث." },
      { q: "كيف أضيف متجري؟", a: "اضغط على «أضف متجرك» واملأ النموذج، وسيتم مراجعته من الإدارة." },
      { q: "هل التسجيل مجاني؟", a: "نعم، التسجيل وإضافة المتاجر مجاني تمامًا." },
    ],
    contact: { email: "info@wain-alaqi.test", phone: "+9620000000000" },
  };
  for (const [key, value] of Object.entries(contentDefaults)) {
    await prisma.content.upsert({ where: { key }, create: { key, value }, update: { value } });
  }

  // Demo search request (no unique on query, so check first)
  const existingReq = await prisma.searchRequest.findFirst({ where: { query: "بطارية كيا سيراتو 2018" } });
  if (!existingReq) {
    await prisma.searchRequest.create({
      data: { query: "بطارية كيا سيراتو 2018", notes: "أبحث عن بطارية أصلية لموديل 2018", status: "SEARCHING", count: 3 },
    });
  }

  console.log(`✅ Seed complete:`);
  console.log(`   - 1 city (الرمثا)`);
  console.log(`   - ${CATEGORIES.length} categories`);
  console.log(`   - ${storeCount} demo stores`);
  console.log(`   - ${productCount} demo products`);
  console.log(`   - ${reviewCount} reviews`);
  console.log(`   - ${owners.length + 2} users (admin, ${owners.length} store owners, 1 user)`);
  console.log(`   - Content defaults set`);
  console.log(`\n   Admin:    admin@example.com / ${DEMO_PASSWORD}`);
  console.log(`   Store:    store1@example.com / ${DEMO_PASSWORD}`);
  console.log(`   User:     user@example.com / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
