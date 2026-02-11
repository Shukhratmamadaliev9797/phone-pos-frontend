import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Search, RotateCcw } from "lucide-react";
import type { InventoryCondition, InventoryStatus } from "@/lib/api/inventory";
import { useI18n } from "@/lib/i18n/provider";

export type InventoryFiltersValue = {
  q: string;
  status: "ALL" | InventoryStatus;
  condition: "ALL" | InventoryCondition;
  brand: string;
};

export function InventoryFilters({
  value,
  brands,
  onChange,
  onReset,
}: {
  value: InventoryFiltersValue;
  brands: string[];
  onChange: (next: InventoryFiltersValue) => void;
  onReset: () => void;
}) {
  const { language } = useI18n();
  const tr = {
    search: language === "uz" ? "Qidirish" : "Search",
    searchPlaceholder:
      language === "uz" ? "IMEI, brend yoki model..." : "IMEI, brand or model...",
    status: language === "uz" ? "Holat" : "Status",
    all: language === "uz" ? "Barchasi" : "All",
    inStock: language === "uz" ? "Sotuvga tayyor (omborda)" : "In Stock",
    inRepair: language === "uz" ? "Ta'mirda" : "In Repair",
    readyForSale: language === "uz" ? "Sotuvga tayyor" : "Ready for Sale",
    sold: language === "uz" ? "Sotilgan" : "Sold",
    returned: language === "uz" ? "Qaytarilgan" : "Returned",
    condition: language === "uz" ? "Holati" : "Condition",
    good: language === "uz" ? "Yaxshi" : "Good",
    used: language === "uz" ? "Ishlatilgan" : "Used",
    broken: language === "uz" ? "Nosoz" : "Broken",
    brand: language === "uz" ? "Brend" : "Brand",
    allBrands: language === "uz" ? "Barcha brendlar" : "All brands",
    reset: language === "uz" ? "Filtrlarni tiklash" : "Reset filters",
  };

  return (
    <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* 🔍 Search (elastic) */}
        <div className="flex min-w-[220px] flex-1 flex-col gap-1">
          <Label htmlFor="search">{tr.search}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder={tr.searchPlaceholder}
              value={value.q}
              onChange={(e) => onChange({ ...value, q: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {/* 🎛 Filters group */}
        <div className="flex flex-wrap items-end gap-2">
          {/* Status */}
          <div className="flex min-w-[120px] flex-col gap-1">
            <Label>{tr.status}</Label>
            <Select
              value={value.status}
              onValueChange={(v) =>
                onChange({ ...value, status: v as InventoryFiltersValue["status"] })
              }
            >
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder={tr.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tr.all}</SelectItem>
                <SelectItem value="IN_REPAIR">{tr.inRepair}</SelectItem>
                <SelectItem value="READY_FOR_SALE">{tr.readyForSale}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Condition */}
          <div className="flex min-w-[120px] flex-col gap-1">
            <Label>{tr.condition}</Label>
            <Select
              value={value.condition}
              onValueChange={(v) =>
                onChange({
                  ...value,
                  condition: v as InventoryFiltersValue["condition"],
                })
              }
            >
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder={tr.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tr.all}</SelectItem>
                <SelectItem value="GOOD">{tr.good}</SelectItem>
                <SelectItem value="USED">{tr.used}</SelectItem>
                <SelectItem value="BROKEN">{tr.broken}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Brand */}
          <div className="flex min-w-[140px] flex-col gap-1">
            <Label>{tr.brand}</Label>
            <Select
              value={value.brand}
              onValueChange={(v) => onChange({ ...value, brand: v })}
            >
              <SelectTrigger className="w-auto min-w-[140px]">
                <SelectValue placeholder={tr.allBrands} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tr.all}</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>
                    {brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset */}
          <Button
            variant="outline"
            className="h-10 px-3"
            title={tr.reset}
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
