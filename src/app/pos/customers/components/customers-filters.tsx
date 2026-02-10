import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, RotateCcw } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CustomerBalanceType } from "@/lib/api/customers";
import { useI18n } from "@/lib/i18n/provider";

export function CustomersFilters({
  search,
  type,
  onSearchChange,
  onTypeChange,
  onReset,
}: {
  search: string;
  type: CustomerBalanceType;
  onSearchChange: (value: string) => void;
  onTypeChange: (value: CustomerBalanceType) => void;
  onReset: () => void;
}) {
  const { language } = useI18n();
  const tr = {
    search: language === "uz" ? "Qidirish" : "Search",
    searchPlaceholder:
      language === "uz"
        ? "Qidirish: telefon raqami, to'liq ism..."
        : "Search: phone number, full name...",
    show: language === "uz" ? "Ko'rsatish" : "Show",
    all: language === "uz" ? "Barchasi" : "All",
    withDebt: language === "uz" ? "Qarzli" : "With Debt",
    withCredit: language === "uz" ? "Kreditli" : "With Credit",
    reset: language === "uz" ? "Filtrlarni tiklash" : "Reset filters",
  };

  return (
    <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-[240px] flex-1 flex-col gap-1">
          <Label htmlFor="customerSearch">{tr.search}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="customerSearch"
              placeholder={tr.searchPlaceholder}
              className="pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-[170px] flex-col gap-1">
            <Label>{tr.show}</Label>
            <Select
              value={type}
              onValueChange={(value) =>
                onTypeChange(value as CustomerBalanceType)
              }
            >
              <SelectTrigger className="w-auto min-w-[170px]">
                <SelectValue placeholder={tr.show} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.all}</SelectItem>
                <SelectItem value="debt">{tr.withDebt}</SelectItem>
                <SelectItem value="credit">{tr.withCredit}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="h-10 px-3"
            title={tr.reset}
            type="button"
            onClick={onReset}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
