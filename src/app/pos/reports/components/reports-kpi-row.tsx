import { Card, CardContent } from "@/components/ui/card";
import type { ReportsOverview } from "@/lib/api/reports";
import { useI18n } from "@/lib/i18n/provider";


function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="pr-2">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-2 text-xl font-semibold">{value}</div>
        {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

export function ReportsKpiRow({ data }: { data: ReportsOverview }) {
  const { language } = useI18n();

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <KpiCard label={language === "uz" ? "Sotuv daromadi" : "Sales Revenue"} value={money(data.salesRevenue)} />
      <KpiCard label={language === "uz" ? "Foyda" : "Profit"} value={money(data.profit)} />
      <KpiCard label={language === "uz" ? "Xarid xarajati" : "Purchase Spending"} value={money(data.purchaseSpending)} />
      <KpiCard label={language === "uz" ? "Ta'mir xarajati" : "Repair Spending"} value={money(data.repairSpending)} />
      <KpiCard label={language === "uz" ? "To'lanmagan sotuvlar (qarz)" : "Unpaid Sales (Debt)"} value={money(data.unpaidSalesDebt)} />
      <KpiCard
        label={language === "uz" ? "To'lanmagan xaridlar (kredit)" : "Unpaid Purchases (Credit)"}
        value={money(data.unpaidPurchasesCredit)}
      />
    </div>
  );
}
