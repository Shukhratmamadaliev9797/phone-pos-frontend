// src/components/pos/help/help-about.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n/provider";

export function HelpAbout() {
  const { language } = useI18n();
  return (
    <Card className="rounded-3xl">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="text-sm font-semibold">About</div>
          <div className="text-sm text-muted-foreground">
            {language === "uz"
              ? "Ilova haqida asosiy ma'lumot (hozircha faqat UI)."
              : "Basic app information"}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border p-4">
            <div className="text-xs text-muted-foreground">
              {language === "uz" ? "Versiya" : "Version"}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-sm font-semibold">v0.1.0</div>
              <Badge className="rounded-full">demo</Badge>
            </div>
          </div>

          <div className="rounded-3xl border p-4">
            <div className="text-xs text-muted-foreground">
              {language === "uz" ? "Muhit" : "Environment"}
            </div>
            <div className="mt-1 text-sm font-semibold">
              {language === "uz" ? "Development" : "Development"}
            </div>
          </div>

          <div className="rounded-3xl border p-4">
            <div className="text-xs text-muted-foreground">Build</div>
            <div className="mt-1 text-sm font-semibold">2026-02-08</div>
          </div>

          <div className="rounded-3xl border p-4">
            <div className="text-xs text-muted-foreground">
              {language === "uz" ? "Eslatma" : "Notes"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {language === "uz"
                ? "Keyinroq Settings bo'limiga real havolalar (Telegram/email) qo'shing."
                : "Add real links (Telegram / email) in Settings later."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
