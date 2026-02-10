import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import type { DashboardOverview } from "@/lib/api/dashboard";
import { useI18n } from "@/lib/i18n/provider";

function money(value: number) {
  return `${Math.round(value).toLocaleString("en-US")} so'm`;
}

export function PaidVsUnpaidCard({
  paidVsUnpaid,
}: {
  paidVsUnpaid: DashboardOverview["paidVsUnpaid"];
}) {
  const { language } = useI18n();
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardHeader>
        <CardTitle className="text-base">
          {language === "uz" ? "To'langan va To'lanmagan" : "Paid vs Unpaid"}
        </CardTitle>
        <CardDescription className="text-xs">
          {language === "uz"
            ? "Qolgan balanslarning tezkor ko'rinishi"
            : "Quick view of outstanding balances"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="rounded-2xl border bg-muted/10 p-4">
          <div className="text-xs text-muted-foreground">
            {language === "uz"
              ? "To'lanmagan sotuvlar jami (Qarz)"
              : "Unpaid sales total (Debt)"}
          </div>
          <div className="mt-1 text-xl font-semibold">{money(paidVsUnpaid.debt)}</div>
          <div className="text-xs text-muted-foreground">
            {language === "uz" ? "Mijozlar do'kondan qarzdor" : "Customers owe shop"}
          </div>
        </div>

        <div className="rounded-2xl border bg-muted/10 p-4">
          <div className="text-xs text-muted-foreground">
            {language === "uz"
              ? "To'lanmagan xaridlar jami (Kredit)"
              : "Unpaid purchases total (Credit)"}
          </div>
          <div className="mt-1 text-xl font-semibold">{money(paidVsUnpaid.credit)}</div>
          <div className="text-xs text-muted-foreground">
            {language === "uz" ? "Do'kon mijozlardan qarzdor" : "Shop owes customers"}
          </div>
        </div>

        <Separator />

        <div className="grid gap-2 sm:grid-cols-2">
          <Button className="rounded-2xl" variant="outline" type="button">
            {language === "uz" ? "Qarzlar" : "View Debts"}
          </Button>
          <Button className="rounded-2xl" variant="outline" type="button">
            {language === "uz" ? "Kreditlar" : "View Credits"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
