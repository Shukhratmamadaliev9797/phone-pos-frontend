import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardOverview } from "@/lib/api/dashboard";
import { useI18n } from "@/lib/i18n/provider";

function money(value: number) {
  return `${Math.round(value).toLocaleString("en-US")} so'm`;
}

export function TopDebtCustomersCard({
  rows,
}: {
  rows: DashboardOverview["topDebtCustomers"];
}) {
  const { language } = useI18n();
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle className="text-base">
          {language === "uz" ? "Top 5 qarzdor mijozlar" : "Top 5 debt customers"}
        </CardTitle>
        <CardDescription className="text-xs">
          {language === "uz"
            ? "Do'kondan eng ko'p qarzdor mijozlar"
            : "Customers who owe the shop the most"}
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
            {language === "uz" ? "Qarzdor mijozlar yo'q" : "No debt customers"}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
