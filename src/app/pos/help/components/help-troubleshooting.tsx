// src/components/pos/help/help-troubleshooting.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ShieldAlert, RefreshCw, ScanSearch } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

const items = [
  {
    title: "Page is blank / not loading",
    icon: RefreshCw,
    points: ["Refresh the page", "Check you are logged in", "Try opening /auth/sign-in again"],
  },
  {
    title: "Can’t find customer",
    icon: ScanSearch,
    points: ["Search by phone number first", "Try different spelling", "Check if it’s a debt or credit customer"],
  },
  {
    title: "IMEI duplicate warning",
    icon: AlertTriangle,
    points: ["Verify IMEI value", "If phone has no IMEI, leave empty", "Configure “Warn vs Block” in Settings"],
  },
  {
    title: "Forbidden / no access",
    icon: ShieldAlert,
    points: ["Your role may not allow this page", "Ask Admin to change your role", "Logout and login again"],
  },
];

export function HelpTroubleshooting() {
  const { language } = useI18n();
  const localizedItems =
    language === "uz"
      ? [
          {
            title: "Sahifa bo'sh / yuklanmayapti",
            icon: RefreshCw,
            points: [
              "Sahifani yangilang",
              "Tizimga kirganingizni tekshiring",
              "Qayta /auth/sign-in orqali kirib ko'ring",
            ],
          },
          {
            title: "Mijoz topilmayapti",
            icon: ScanSearch,
            points: [
              "Avval telefon raqami bo'yicha qidiring",
              "Yozilishni boshqacha sinab ko'ring",
              "Mijoz debt yoki credit ro'yxatida ekanini tekshiring",
            ],
          },
          {
            title: "IMEI takrorlanish ogohlantirishi",
            icon: AlertTriangle,
            points: [
              "IMEI qiymatini qayta tekshiring",
              "Telefon IMEI'siz bo'lsa bo'sh qoldiring",
              "Settings'da “Warn vs Block” sozlamasini ko'rib chiqing",
            ],
          },
          {
            title: "Forbidden / kirish yo'q",
            icon: ShieldAlert,
            points: [
              "Roldingiz bu sahifaga ruxsat bermasligi mumkin",
              "Admin’dan rolni o'zgartirishni so'rang",
              "Logout qilib qayta login qiling",
            ],
          },
        ]
      : items;

  return (
    <Card className="rounded-3xl">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="text-sm font-semibold">Troubleshooting</div>
          <div className="text-sm text-muted-foreground">
            {language === "uz"
              ? "Ko'p uchraydigan muammolar uchun tezkor yechimlar."
              : "Quick fixes for common issues."}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-3 sm:grid-cols-2">
          {localizedItems.map((it) => (
            <div key={it.title} className="rounded-3xl border p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border bg-muted/10 p-2">
                  <it.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{it.title}</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {it.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
