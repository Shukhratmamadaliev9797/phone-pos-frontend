import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardOverview } from "@/lib/api/dashboard";
import { useI18n } from "@/lib/i18n/provider";

function money(value: number) {
  return `${Math.round(value).toLocaleString("en-US")} so'm`;
}

export function TopCreditCustomersCard({
  rows,
}: {
  rows: DashboardOverview["topCreditCustomers"];
}) {
  const { language } = useI18n();
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardHeader>
        <CardTitle className="text-base">
          {language === "uz" ? "Top 5 kredit mijozlar" : "Top 5 credit customers"}
        </CardTitle>
        <CardDescription className="text-xs">
          {language === "uz"
            ? "Do'kon pul qaytarishi kerak bo'lgan mijozlar"
            : "Customers the shop needs to pay back"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {rows.map((c, idx) => (
          <div
            key={c.id}
            className="flex items-center gap-3 rounded-2xl border bg-muted/10 px-3 py-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-xs font-semibold">
              {idx + 1}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{c.name}</div>
              <div className="truncate text-xs text-muted-foreground">{c.phone}</div>
            </div>

            <div className="text-sm font-semibold">{money(c.amount)}</div>
          </div>
        ))}
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            {language === "uz" ? "Kredit mijozlar yo'q" : "No credit customers"}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
