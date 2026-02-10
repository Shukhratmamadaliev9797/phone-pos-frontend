import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
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
    searchPlaceholder:
      language === "uz"
        ? "Qidirish: Sotuv ID, mijoz tel/ismi, IMEI, brend/model..."
        : "Search: Sale ID, customer phone/name, IMEI, brand/model...",
    paymentType: language === "uz" ? "To'lov turi" : "Payment type",
    allTypes: language === "uz" ? "Barcha turlar" : "All types",
    paidNow: language === "uz" ? "Hozir to'langan" : "Paid now",
    payLater: language === "uz" ? "Keyin to'lash" : "Pay later",
    reset: language === "uz" ? "Tiklash" : "Reset",
  };

  return (
    <Card className="rounded-3xl">
      <CardContent >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search takes remaining space */}
          <div className="flex-1">
            <Input
              placeholder={tr.searchPlaceholder}
              className="h-10 rounded-2xl"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          {/* Filters on the right; wrap under on smaller screens */}
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Input
              type="date"
              className="h-10 w-[170px] rounded-2xl"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
            />
            <Input
              type="date"
              className="h-10 w-[170px] rounded-2xl"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
            />

            <Select value={paymentType} onValueChange={(value) => onPaymentTypeChange(value as "all" | SalePaymentType)}>
              <SelectTrigger className="h-10 w-[160px] rounded-2xl">
                <SelectValue placeholder={tr.paymentType} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.allTypes}</SelectItem>
                <SelectItem value="PAID_NOW">{tr.paidNow}</SelectItem>
                <SelectItem value="PAY_LATER">{tr.payLater}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="h-10 rounded-2xl" type="button" onClick={onReset}>
              <X className="mr-2 h-4 w-4" />
              {tr.reset}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
