import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  Wallet,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

type Summary = {
  totalCustomers: number;
  customersWithDebt: number;
  customersWithCredit: number;
  totalDebt: number;
  totalCredit: number;
};

export function CustomersSummaryRow({
  summary,
}: {
  summary?: Partial<Summary>;
}) {
  const { language } = useI18n();
  const s: Summary = {
    totalCustomers: summary?.totalCustomers ?? 0,
    customersWithDebt: summary?.customersWithDebt ?? 0,
    customersWithCredit: summary?.customersWithCredit ?? 0,
    totalDebt: summary?.totalDebt ?? 0,
    totalCredit: summary?.totalCredit ?? 0,
  };

  const items = [
    {
      label: "Total Customers",
      labelUz: "Jami mijozlar",
      value: s.totalCustomers.toLocaleString("en-US"),
      icon: Users,
    },
    {
      label: "Customers with Debt",
      labelUz: "Qarzli mijozlar",
      value: s.customersWithDebt.toLocaleString("en-US"),
      icon: TrendingUp,
    },
    {
      label: "Customers with Credit",
      labelUz: "Kreditli mijozlar",
      value: s.customersWithCredit.toLocaleString("en-US"),
      icon: TrendingDown,
    },
    {
      label: "Total Debt amount",
      labelUz: "Jami qarz summasi",
      value: money(s.totalDebt),
      icon: CircleDollarSign,
    },
    {
      label: "Total Credit amount",
      labelUz: "Jami kredit summasi",
      value: money(s.totalCredit),
      icon: Wallet,
    },
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((it) => (
        <Card key={it.label} className="rounded-3xl border-muted/40 bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">
                  {language === "uz" ? it.labelUz : it.label}
                </div>
                <div className="mt-1 text-lg font-semibold">{it.value}</div>
              </div>
              <div className="rounded-2xl border bg-muted/10 p-2">
                <it.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
