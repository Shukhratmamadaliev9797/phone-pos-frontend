// src/components/pos/help/help-faq.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/lib/i18n/provider";

const faqs = [
  {
    q: "Why can’t I sell this phone?",
    a: "Most common reasons: it is already Sold, or status is not In Stock / Ready for Sale. Check inventory status and history.",
  },
  {
    q: "What’s the difference between Debt and Credit?",
    a: "Debt = customer owes the shop (pay-later sale). Credit = shop owes customer (pay-later purchase). We show them separately.",
  },
  {
    q: "Why customer info is required on pay-later?",
    a: "Because the system must track balances and payment history. At least phone number is required for debt/credit cases.",
  },
  {
    q: "How is profit calculated?",
    a: "Profit per phone = sale revenue − (purchase price + repair costs). Profit and cash flow are different views.",
  },
  {
    q: "Can I delete a sale/purchase?",
    a: "By default, financial records should not be deleted. Prefer “void/cancel” with a reason to keep audit history.",
  },
];

export function HelpFaq() {
  const { language } = useI18n();
  const localizedFaqs =
    language === "uz"
      ? [
          {
            q: "Nega bu telefonni sota olmayapman?",
            a: "Ko'p uchraydigan sabablar: telefon allaqachon Sold, yoki statusi In Stock / Ready for Sale emas. Inventardagi status va tarixni tekshiring.",
          },
          {
            q: "Debt va Credit o'rtasidagi farq nima?",
            a: "Debt = mijoz do'kondan qarzdor (pay-later sale). Credit = do'kon mijozdan qarzdor (pay-later purchase). Tizimda ular alohida ko'rsatiladi.",
          },
          {
            q: "Nega pay-later bo'lganda mijoz ma'lumoti majburiy?",
            a: "Balans va to'lov tarixini to'g'ri yuritish uchun. Debt/Credit holatlarida kamida telefon raqami kiritilishi kerak.",
          },
          {
            q: "Foyda qanday hisoblanadi?",
            a: "Telefon bo'yicha foyda = sotuv daromadi − (xarid narxi + ta'mir xarajatlari). Foyda va pul oqimi turli ko'rsatkichlar.",
          },
          {
            q: "Sale/Purchase ni o'chirish mumkinmi?",
            a: "Odatiy holatda moliyaviy yozuvlar o'chirilmaydi. Audit uchun sabab bilan “void/cancel” ishlatish tavsiya qilinadi.",
          },
        ]
      : faqs;

  return (
    <Card className="rounded-3xl">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="text-sm font-semibold">FAQ</div>
          <div className="text-sm text-muted-foreground">
            {language === "uz"
              ? "Kundalik ishlashdagi ko'p beriladigan savollar."
              : "Common questions from daily operations."}
          </div>
        </div>

        <Separator className="my-4" />

        <Accordion type="single" collapsible className="w-full">
          {localizedFaqs.map((f) => (
            <AccordionItem key={f.q} value={f.q}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>
                <div className="text-sm text-muted-foreground">{f.a}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
