import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Wallet, Clock, Calculator } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

function Stat({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  hint?: string;
}) {
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
            {hint && (
              <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
            )}
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-muted/40">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function money(value: number) {
  return `${Math.max(0, Math.round(value)).toLocaleString("en-US")} so'm`;
}

export function RepairsSummary({
  totalRepairs,
  totalSpending,
  pendingCount,
  avgCost,
}: {
  totalRepairs: number;
  totalSpending: number;
  pendingCount: number;
  avgCost: number;
  topTechnician: string;
}) {
  const { language } = useI18n();

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
      {/* Repaired phones count */}
      <Stat
        label={language === "uz" ? "Jami tayyor telefonlar" : "Total repaired phones"}
        value={String(totalRepairs)}
        icon={Wrench}
        hint={language === "uz" ? "DONE holatdagilar soni" : "Count of DONE status"}
      />

      {/* Total spending */}
      <Stat
        label={
          language === "uz" ? "Jami ta'mir xarajati" : "Total repair spending"
        }
        value={money(totalSpending)}
        icon={Wallet}
      />

      {/* Pending */}
      <Stat
        label={language === "uz" ? "Kutilayotgan ta'mirlar" : "Pending repairs"}
        value={String(pendingCount)}
        icon={Clock}
      />

      {/* Avg cost (optional) */}
      <Stat
        label={language === "uz" ? "O'rtacha ta'mir narxi" : "Avg repair cost"}
        value={money(avgCost)}
        icon={Calculator}
      />
    </div>
  );
}
