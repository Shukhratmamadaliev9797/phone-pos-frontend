import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
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

export function RepairsReportPanel({ data }: { data: ReportsOverview }) {
  const { language } = useI18n();

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-muted/40 bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">
                {language === "uz" ? "Vaqt bo'yicha ta'mir xarajati" : "Repair spending over time"}
              </div>
              <div className="text-sm text-muted-foreground">
                {language === "uz" ? "Tanlangan davr" : "Selected period"}
              </div>
            </div>
            <Badge variant="secondary" className="rounded-full">UI demo</Badge>
          </div>

          <div className="mt-4 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.repairsSpendingSeries.map((item) => ({
                  label: item.label,
                  spending: item.value,
                }))}
                margin={{ left: 4, right: 8, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip formatter={(v) => money(Number(v))} />
                <Bar dataKey="spending" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-5">
        <MiniCard label={language === "uz" ? "Ta'mirlar (soni)" : "Repairs (count)"} value={String(data.repairsCount)} />
        <MiniCard label={language === "uz" ? "Jami xarajat" : "Total spending"} value={money(data.repairsTotalSpending)} />
        <MiniCard label={language === "uz" ? "Kutilmoqda" : "Pending"} value={String(data.repairsPending)} />
        <MiniCard label={language === "uz" ? "O'rtacha ta'mir narxi" : "Avg repair cost"} value={money(data.repairsAvgCost)} />
        <MiniCard label={language === "uz" ? "Eng faol texnik" : "Top technician"} value={data.repairsTopTechnician} />
      </div>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="pr-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-2 text-lg font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
