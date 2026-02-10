import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { ReportsOverview } from "@/lib/api/reports";
import { useI18n } from "@/lib/i18n/provider";


function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}


export function PurchasesReportPanel({ data }: { data: ReportsOverview }) {
  const { language } = useI18n();

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-muted/40 bg-muted/30">
        <CardContent className="pr-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">
                {language === "uz" ? "Vaqt bo'yicha xarid xarajati" : "Purchase spending over time"}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === "uz" ? "Tanlangan sana oralig'iga asoslangan" : "Based on selected date range"}
              </div>
            </div>
            <Badge variant="secondary" className="rounded-full">UI demo</Badge>
          </div>

          <div className="mt-4 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.purchasesSpendingSeries.map((item) => ({
                  label: item.label,
                  spend: item.value,
                }))}
                margin={{ left: 4, right: 8, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000000)}M`} />
                <Tooltip formatter={(v) => money(Number(v))} />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        <MiniCard label={language === "uz" ? "Sotib olingan telefonlar" : "Phones bought"} value={String(data.purchasesPhonesBought)} />
        <MiniCard label={language === "uz" ? "O'rtacha xarid narxi" : "Avg purchase cost"} value={money(data.purchasesAvgCost)} />
        <MiniCard
          label={language === "uz" ? "Hozir to'langan jami" : "Paid now total"}
          value={money(data.purchasesPaidNowTotal)}
        />
        <MiniCard
          label={language === "uz" ? "Qolgan (kredit)" : "Remaining (credit)"}
          value={money(data.purchasesRemainingCredit)}
        />
      </div>

      
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-2 text-lg font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
