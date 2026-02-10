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
import type { SalePaymentType } from "@/lib/api/sales";
import { useI18n } from "@/lib/i18n/provider";

export function SalesFilters({
  search,
  onSearchChange,
  paymentType,
  onPaymentTypeChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  paymentType: "all" | SalePaymentType;
  onPaymentTypeChange: (value: "all" | SalePaymentType) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
}) {
  const { language } = useI18n();
  const tr = {
    search: language === "uz" ? "Qidirish" : "Search",
    searchPlaceholder:
      language === "uz"
        ? "Qidirish: Sotuv ID, mijoz tel/ismi, IMEI, brend/model..."
        : "Search: Sale ID, customer phone/name, IMEI, brand/model...",
    from: language === "uz" ? "Dan" : "From",
    to: language === "uz" ? "Gacha" : "To",
    paymentType: language === "uz" ? "To'lov turi" : "Payment type",
    allTypes: language === "uz" ? "Barcha turlar" : "All types",
    paidNow: language === "uz" ? "Hozir to'langan" : "Paid now",
    payLater: language === "uz" ? "Keyin to'lash" : "Pay later",
    reset: language === "uz" ? "Filtrlarni tiklash" : "Reset filters",
  };

  return (
    <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-[240px] flex-1 flex-col gap-1">
          <Label htmlFor="salesSearch">{tr.search}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="salesSearch"
              placeholder={tr.searchPlaceholder}
              className="pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-[170px] flex-col gap-1">
            <Label>{tr.from}</Label>
            <Input
              type="date"
              className="h-10 w-[170px]"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
            />
          </div>

          <div className="flex min-w-[170px] flex-col gap-1">
            <Label>{tr.to}</Label>
            <Input
              type="date"
              className="h-10 w-[170px]"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
            />
          </div>

          <div className="flex min-w-[160px] flex-col gap-1">
            <Label>{tr.paymentType}</Label>
            <Select value={paymentType} onValueChange={(value) => onPaymentTypeChange(value as "all" | SalePaymentType)}>
              <SelectTrigger className="h-10 w-auto min-w-[160px]">
                <SelectValue placeholder={tr.paymentType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.allTypes}</SelectItem>
                <SelectItem value="PAID_NOW">{tr.paidNow}</SelectItem>
                <SelectItem value="PAY_LATER">{tr.payLater}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="h-10 px-3" title={tr.reset} type="button" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
