export type HelpRole = "ADMIN" | "MANAGER" | "CASHIER" | "TECHNICIAN";
type HelpLanguage = "en" | "uz";

export type HelpGuideRecord = {
  id: string;
  module: string;
  title: string;
  summary: string;
  path: string;
  roles: HelpRole[];
  keywords: string[];
  steps: string[];
};

export const HELP_GUIDES: HelpGuideRecord[] = [
  {
    id: "purchase",
    module: "Purchases",
    title: "Buying a Phone (Purchase)",
    summary: "Create purchase, calculate remaining, and register phone in inventory.",
    path: "/purchases",
    roles: ["ADMIN", "MANAGER", "CASHIER"],
    keywords: ["purchase", "buy", "credit", "pay later", "inventory", "imei"],
    steps: [
      "Open Purchases and click New Purchase.",
      "Enter phone details and purchase price.",
      "Choose payment type (paid now/pay later).",
      "If remaining > 0, add customer details to track credit.",
      "Save purchase and verify item status in inventory.",
    ],
  },
  {
    id: "sale",
    module: "Sales",
    title: "Selling a Phone (Sale)",
    summary: "Sell in-stock/ready phones and track debt for pay-later sales.",
    path: "/sales",
    roles: ["ADMIN", "MANAGER", "CASHIER"],
    keywords: ["sale", "sell", "debt", "remaining", "cart", "customer"],
    steps: [
      "Open Sales and click New Sale.",
      "Select available phone(s) from inventory.",
      "Set sale prices and payment type.",
      "If remaining > 0, add customer details.",
      "Save and confirm phone status becomes SOLD.",
    ],
  },
  {
    id: "repair",
    module: "Repairs",
    title: "Repair Workflow",
    summary: "Create and maintain repair cases, costs, and completion flow.",
    path: "/repairs",
    roles: ["ADMIN", "MANAGER", "TECHNICIAN"],
    keywords: ["repair", "technician", "done", "cost", "parts", "labor"],
    steps: [
      "Open Repairs and create/select a repair case.",
      "Add repair entry with description and costs.",
      "Update case status to DONE when completed.",
      "Verify inventory status changes to READY_FOR_SALE when applicable.",
      "Check activities for all repair events and payments.",
    ],
  },
  {
    id: "customers",
    module: "Customers",
    title: "Debt/Credit Customers",
    summary: "Work with customers that have outstanding debt or credit only.",
    path: "/customers",
    roles: ["ADMIN", "MANAGER", "CASHIER"],
    keywords: ["customers", "debt", "credit", "balances", "phone number"],
    steps: [
      "Open Customers list and search by phone or full name.",
      "Open details to view debt, credit, phones, and activities.",
      "Use add payment only for valid remaining amount.",
      "Confirm remaining updates and payment activity is created.",
    ],
  },
  {
    id: "inventory",
    module: "Inventory",
    title: "Inventory Operations",
    summary: "Track item statuses and run quick actions for stock lifecycle.",
    path: "/inventory",
    roles: ["ADMIN", "MANAGER", "CASHIER", "TECHNICIAN"],
    keywords: ["inventory", "status", "in stock", "in repair", "sold", "ready"],
    steps: [
      "Use filters by status, condition, and keyword.",
      "Open phone details to inspect cost breakdown and history.",
      "Run actions based on role (repair/sale/edit/delete).",
      "Verify status transitions are consistent with business flow.",
    ],
  },
  {
    id: "reports",
    module: "Reports",
    title: "Reports and Export",
    summary: "Read KPIs and export short PDF report for management.",
    path: "/reports",
    roles: ["ADMIN"],
    keywords: ["reports", "pdf", "profit", "revenue", "spending", "kpi"],
    steps: [
      "Open Reports and review KPI cards.",
      "Inspect sales, purchases, repairs, and customer tabs.",
      "Use export button for short PDF snapshot.",
    ],
  },
  {
    id: "workers",
    module: "Workers",
    title: "Workers and Salary",
    summary: "Manage workers, dashboard access, and monthly salary payments.",
    path: "/workers",
    roles: ["ADMIN"],
    keywords: ["workers", "salary", "dashboard access", "create worker"],
    steps: [
      "Create worker profile with role and monthly salary.",
      "Optionally create dashboard login credentials.",
      "Track salary payment history by month.",
    ],
  },
  {
    id: "settings",
    module: "Settings",
    title: "System Settings",
    summary: "Configure app-level preferences and appearance mode.",
    path: "/settings",
    roles: ["ADMIN"],
    keywords: ["settings", "theme", "dark mode", "store profile"],
    steps: [
      "Open Settings.",
      "Update store profile fields and defaults.",
      "Switch light/dark/system theme mode.",
    ],
  },
];

const UZ_GUIDES: Record<
  string,
  Pick<HelpGuideRecord, "module" | "title" | "summary" | "keywords" | "steps">
> = {
  purchase: {
    module: "Xaridlar",
    title: "Telefon xarid qilish (Purchase)",
    summary: "Xarid yarating, qolgan summani hisoblang va telefonni inventarga kiriting.",
    keywords: ["xarid", "sotib olish", "kredit", "keyin to'lash", "inventar", "imei"],
    steps: [
      "Purchases bo'limini ochib New Purchase ni bosing.",
      "Telefon ma'lumotlari va xarid narxini kiriting.",
      "To'lov turini tanlang (hozir/keyin).",
      "Agar remaining > 0 bo'lsa, kredit uchun mijoz ma'lumotini kiriting.",
      "Saqlang va telefon statusi inventarda to'g'ri ekanini tekshiring.",
    ],
  },
  sale: {
    module: "Sotuvlar",
    title: "Telefon sotish (Sale)",
    summary: "Mavjud telefonni soting va keyin to'lov bo'lsa qarzdorlikni kuzating.",
    keywords: ["sotuv", "sotish", "qarz", "remaining", "cart", "mijoz"],
    steps: [
      "Sales bo'limida New Sale ni bosing.",
      "Inventardan mavjud telefon(lar)ni tanlang.",
      "Sotuv narxi va to'lov turini belgilang.",
      "Agar remaining > 0 bo'lsa, mijoz ma'lumotini kiriting.",
      "Saqlang va telefon statusi SOLD bo'lganini tasdiqlang.",
    ],
  },
  repair: {
    module: "Ta'mirlar",
    title: "Ta'mir jarayoni",
    summary: "Ta'mir ishlarini yarating, xarajatlarni yuriting va yakunlash oqimini boshqaring.",
    keywords: ["ta'mir", "texnik", "done", "xarajat", "detal", "mehnat"],
    steps: [
      "Repairs bo'limida ta'mir ishini yarating yoki tanlang.",
      "Description va xarajatlar bilan repair entry qo'shing.",
      "Ish tugaganda holatni DONE qiling.",
      "Mos bo'lsa, inventar holati READY_FOR_SALE ga o'zgarganini tekshiring.",
      "Barcha ta'mir hodisalari va to'lovlar activityda bo'lishini tekshiring.",
    ],
  },
  customers: {
    module: "Mijozlar",
    title: "Qarz/Kredit mijozlar",
    summary: "Faqat qarz yoki kredit qolgan mijozlar bilan ishlash.",
    keywords: ["mijozlar", "qarz", "kredit", "balans", "telefon raqami"],
    steps: [
      "Customers ro'yxatida telefon yoki ism bo'yicha qidiring.",
      "Details oynasida qarz, kredit, telefonlar va activityni ko'ring.",
      "Add payment faqat remaining doirasida ishlating.",
      "Remaining yangilanganini va payment activity yaratilganini tekshiring.",
    ],
  },
  inventory: {
    module: "Inventar",
    title: "Inventar amallari",
    summary: "Telefon statuslarini kuzating va lifecycle amallarini bajaring.",
    keywords: ["inventar", "status", "in stock", "in repair", "sold", "ready"],
    steps: [
      "Status, condition va kalit so'z bo'yicha filtrlang.",
      "Phone details oynasida cost breakdown va tarixni ko'ring.",
      "Rolga mos actionlardan foydalaning (repair/sale/edit/delete).",
      "Status o'tishlari biznes oqimiga mos bo'lishini tekshiring.",
    ],
  },
  reports: {
    module: "Hisobotlar",
    title: "Hisobot va eksport",
    summary: "KPIlarni ko'ring va qisqa PDF hisobotni yuklab oling.",
    keywords: ["hisobot", "pdf", "foyda", "daromad", "xarajat", "kpi"],
    steps: [
      "Reports bo'limida KPI kartalarni tekshiring.",
      "Sales, purchases, repairs va customers tablarini ko'ring.",
      "Qisqa PDF uchun export tugmasidan foydalaning.",
    ],
  },
  workers: {
    module: "Xodimlar",
    title: "Xodimlar va oylik",
    summary: "Xodimlarni boshqaring, dashboard access va oylik to'lovlarni yuriting.",
    keywords: ["xodim", "oylik", "dashboard access", "xodim yaratish"],
    steps: [
      "Rol va oylik bilan xodim profilini yarating.",
      "Ixtiyoriy ravishda dashboard login ma'lumotini yarating.",
      "Oylik to'lov tarixini oylar bo'yicha kuzating.",
    ],
  },
  settings: {
    module: "Sozlamalar",
    title: "Tizim sozlamalari",
    summary: "Ilova sozlamalari va ko'rinish rejimini boshqaring.",
    keywords: ["sozlama", "theme", "dark mode", "do'kon profili"],
    steps: [
      "Settings bo'limini oching.",
      "Do'kon profili va default qiymatlarni yangilang.",
      "Light/dark/system theme rejimini tanlang.",
    ],
  },
};

export function getLocalizedGuides(language: HelpLanguage): HelpGuideRecord[] {
  if (language === "en") return HELP_GUIDES;
  return HELP_GUIDES.map((guide) => {
    const localized = UZ_GUIDES[guide.id];
    if (!localized) return guide;
    return {
      ...guide,
      module: localized.module,
      title: localized.title,
      summary: localized.summary,
      keywords: localized.keywords,
      steps: localized.steps,
    };
  });
}

export function normalizeHelpRole(role: string | undefined): HelpRole {
  if (!role) return "CASHIER";
  if (role === "OWNER_ADMIN") return "ADMIN";
  if (role === "ADMIN" || role === "MANAGER" || role === "CASHIER" || role === "TECHNICIAN") {
    return role;
  }
  return "CASHIER";
}

export function filterGuidesByRoleAndQuery(
  role: HelpRole,
  query: string,
  language: HelpLanguage = "en",
): HelpGuideRecord[] {
  const guides = getLocalizedGuides(language);
  const normalized = query.trim().toLowerCase();
  const roleFiltered = guides.filter((guide) => guide.roles.includes(role));
  if (!normalized) return roleFiltered;

  return roleFiltered.filter((guide) => {
    const haystack = [
      guide.module,
      guide.title,
      guide.summary,
      guide.path,
      ...guide.keywords,
      ...guide.steps,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });
}
