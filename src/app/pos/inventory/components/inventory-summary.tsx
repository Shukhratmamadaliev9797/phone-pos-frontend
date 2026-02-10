import { Card, CardContent } from "@/components/ui/card";
import { Package, Wrench, BadgeCheck, Banknote } from "lucide-react";
import type { InventoryRow } from "./inventory-table";
import { useI18n } from "@/lib/i18n/provider";

type SummaryItem = {
  label: string;
  value: string;
  hint?: string;
  icon: React.ElementType;
};

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

export function InventorySummary({ rows }: { rows: InventoryRow[] }) {
  const { language } = useI18n();
  const inStock = rows.filter((row) => row.status === "IN_STOCK").length;
  const inRepair = rows.filter((row) => row.status === "IN_REPAIR").length;
  const readyForSale = rows.filter((row) => row.status === "READY_FOR_SALE").length;
  const totalCost = rows.reduce((sum, row) => {
    const expectedPrice =
      row.expectedPrice === undefined || row.expectedPrice === null
        ? null
        : Number(row.expectedPrice);
    const fallbackCost = Number(row.cost) || 0;
    return sum + (expectedPrice ?? fallbackCost);
  }, 0);

  const items: SummaryItem[] = [
    {
      label: language === "uz" ? "Omborda" : "In Stock",
      value: String(inStock),
      hint: language === "uz" ? "mavjud telefonlar" : "phones available",
      icon: Package,
    },
    {
      label: language === "uz" ? "Ta'mirda" : "In Repair",
      value: String(inRepair),
      hint: language === "uz" ? "ta'mirlanmoqda" : "being repaired",
      icon: Wrench,
    },
    {
      label: language === "uz" ? "Sotuvga tayyor" : "Ready for Sale",
      value: String(readyForSale),
      hint: language === "uz" ? "hozir sotish mumkin" : "can be sold now",
      icon: BadgeCheck,
    },
    {
      label: language === "uz" ? "Inventar qiymati" : "Inventory Cost",
      value: money(totalCost),
      hint: language === "uz" ? "kutilgan narx yoki umumiy tannarx" : "expected price or total cost",
      icon: Banknote,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="rounded-3xl border-muted/40 bg-muted/30">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-muted-foreground">
                    {item.label}
                  </div>
                  <div className="mt-1 text-2xl font-semibold tracking-tight">
                    {item.value}
                  </div>
                  {item.hint && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.hint}
                    </div>
                  )}
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border bg-muted/20">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
