import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DashboardOverview } from "@/lib/api/dashboard";
import { useI18n } from "@/lib/i18n/provider";

type Range = "weekly" | "monthly" | "yearly";

function formatSum(val: number) {
  return `${val.toLocaleString("en-US")} so'm`;
}

function CustomTooltip({
  active,
  payload,
  label,
  language,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  language: "en" | "uz";
}) {
  if (!active || !payload?.length) return null;

  const revenue = payload[0]?.value ?? 0;

  return (
    <div className="rounded-2xl border bg-background px-3 py-2 shadow-sm">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-semibold">{formatSum(revenue)}</div>
      <div className="text-[11px] text-muted-foreground">
        {language === "uz" ? "Daromad" : "Revenue"}
      </div>
    </div>
  );
}

export function SalesRevenueChart({
  series,
}: {
  series: DashboardOverview["salesRevenue"];
}) {
  const { language } = useI18n();
  const [range, setRange] = React.useState<Range>("monthly");

  const data = React.useMemo(() => {
    if (range === "weekly") return series.weekly;
    if (range === "yearly") return series.yearly;
    return series.monthly;
  }, [range, series.monthly, series.weekly, series.yearly]);

  // small helper: show total for selected range (UI nice)
  const total = React.useMemo(
    () => data.reduce((sum, p) => sum + p.revenue, 0),
    [data]
  );

  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle className="text-base">
            {language === "uz" ? "Sotuv daromadi" : "Sales Revenue"}
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            {language === "uz" ? "Jami" : "Total"}:{" "}
            <span className="font-medium text-foreground">{formatSum(total)}</span>
          </div>
        </div>

        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger className="h-9 w-[140px] rounded-2xl">
            <SelectValue placeholder={language === "uz" ? "Oylik" : "Monthly"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">{language === "uz" ? "Haftalik" : "Weekly"}</SelectItem>
            <SelectItem value="monthly">{language === "uz" ? "Oylik" : "Monthly"}</SelectItem>
            <SelectItem value="yearly">{language === "uz" ? "Yillik" : "Yearly"}</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={40}
                tickMargin={10}
                tickFormatter={(v) => `${Math.round(Number(v) / 1000000)}m`}
              />
              <Tooltip
                cursor={{ strokeWidth: 0, fill: "rgba(0,0,0,0.04)" }}
                content={<CustomTooltip language={language} />}
              />

              {/* Single line */}
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1D4ED8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
