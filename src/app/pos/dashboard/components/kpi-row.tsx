import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, Phone } from "lucide-react";
import type { DashboardOverview } from "@/lib/api/dashboard";
import { useI18n } from "@/lib/i18n/provider";
import type { KPI } from "../types";

function Delta({
  value,
  label = "From Last Month",
}: {
  value: number;
  label?: string;
}) {
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;

  return (
    <div className="mt-3 flex items-center gap-2 text-xs">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
          up
            ? "bg-emerald-500/10 text-emerald-700"
            : "bg-rose-500/10 text-rose-700",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {up ? "+" : ""}
        {value}%
      </span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function KpiCard({ item }: { item: KPI }) {
  const isPrimary = item.variant === "primary";
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-muted/40 bg-muted/30 p-4 shadow-sm",
        isPrimary &&
          "border-transparent text-white bg-gradient-to-br from-indigo-600 to-violet-500",
      )}
    >
      {/* subtle glow */}
      {isPrimary && (
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div
            className={cn(
              "text-xs",
              isPrimary ? "text-white/80" : "text-muted-foreground",
            )}
          >
            {item.title}
          </div>
          <div
            className={cn(
              "mt-2 text-2xl font-semibold tracking-tight",
              isPrimary && "text-white",
            )}
          >
            {item.value}
          </div>
        </div>

        <div
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-xl",
            isPrimary ? "bg-white/15" : "bg-muted/40",
          )}
          aria-hidden="true"
        >
          {Icon ? (
            <Icon
              className={cn(
                "h-5 w-5",
                isPrimary ? "text-white" : "text-foreground",
              )}
            />
          ) : (
            <span
              className={cn(
                "text-sm font-semibold",
                isPrimary ? "text-white" : "text-foreground",
              )}
            >
              ↗
            </span>
          )}
        </div>
      </div>

      <div className={cn(isPrimary && "text-white/90")}>
        <Delta value={item.deltaPercent} label={item.deltaLabel} />
      </div>
    </div>
  );
}

export function DashboardKpiRow({ kpis }: { kpis: DashboardOverview["kpis"] }) {
  const { language } = useI18n();
  const fromLastMonth = language === "uz" ? "O'tgan oydan" : "From Last Month";
  const items: KPI[] = [
    {
      title: language === "uz" ? "Foyda" : "Profit",
      value: `${Math.round(kpis.profit.current).toLocaleString("en-US")} so'm`,
      deltaPercent: kpis.profit.deltaPercent,
      deltaLabel: fromLastMonth,
      variant: "default",
      icon: TrendingUp,
    },
    {
      title: language === "uz" ? "Xarid xarajati" : "Purchase Spending",
      value: `${Math.round(kpis.purchaseSpending.current).toLocaleString("en-US")} so'm`,
      deltaPercent: kpis.purchaseSpending.deltaPercent,
      deltaLabel: fromLastMonth,
      variant: "default",
      icon: TrendingDown,
    },
    {
      title: language === "uz" ? "Ta'mir xarajati" : "Repair Spending",
      value: `${Math.round(kpis.repairSpending.current).toLocaleString("en-US")} so'm`,
      deltaPercent: kpis.repairSpending.deltaPercent,
      deltaLabel: fromLastMonth,
      variant: "default",
      icon: TrendingUp,
    },
    {
      title: language === "uz" ? "Sotilgan telefonlar" : "Sold Phones",
      value: String(Math.round(kpis.soldPhones.current)),
      deltaPercent: kpis.soldPhones.deltaPercent,
      deltaLabel: fromLastMonth,
      variant: "default",
      icon: Phone,
    },
  ];

  return (
    <section className="w-full">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <KpiCard key={item.title} item={item} />
        ))}
      </div>
    </section>
  );
}
