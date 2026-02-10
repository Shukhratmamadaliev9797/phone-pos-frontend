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
import { useI18n } from "@/lib/i18n/provider";

type DateRangeValue = "all" | "today" | "week" | "month" | "custom";
type PaymentTypeValue = "all" | "PAID_NOW" | "PAY_LATER";
type PaymentMethodValue = "all" | "CASH" | "CARD" | "OTHER";
type StatusValue = "all" | "paid" | "partial" | "unpaid";

type PurchasesFiltersProps = {
  search: string;
  dateRange: DateRangeValue;
  paymentType: PaymentTypeValue;
  paymentMethod: PaymentMethodValue;
  status: StatusValue;
  customFrom: string;
  customTo: string;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (value: DateRangeValue) => void;
  onPaymentTypeChange: (value: PaymentTypeValue) => void;
  onPaymentMethodChange: (value: PaymentMethodValue) => void;
  onStatusChange: (value: StatusValue) => void;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  onReset: () => void;
};

export function PurchasesFilters({
  search,
  dateRange,
  paymentType,
  paymentMethod,
  status,
  customFrom,
  customTo,
  onSearchChange,
  onDateRangeChange,
  onPaymentTypeChange,
  onPaymentMethodChange,
  onStatusChange,
  onCustomFromChange,
  onCustomToChange,
  onReset,
}: PurchasesFiltersProps) {
  const { language } = useI18n();
  const tr = {
    search: language === "uz" ? "Qidirish" : "Search",
    searchPlaceholder:
      language === "uz"
        ? "Mijoz ismi, telefon raqami, telefon brendi/modeli..."
        : "Customer name, phone number, phone brand/model...",
    dateRange: language === "uz" ? "Sana oralig'i" : "Date range",
    all: language === "uz" ? "Barchasi" : "All",
    today: language === "uz" ? "Bugun" : "Today",
    week: language === "uz" ? "Shu hafta" : "This week",
    month: language === "uz" ? "Shu oy" : "This month",
    custom: language === "uz" ? "Maxsus..." : "Custom...",
    paymentType: language === "uz" ? "To'lov turi" : "Payment type",
    paidNow: language === "uz" ? "Hozir to'langan" : "Paid now",
    payLater: language === "uz" ? "Keyin to'lash" : "Pay later",
    method: language === "uz" ? "Usul" : "Method",
    cash: language === "uz" ? "Naqd" : "Cash",
    card: language === "uz" ? "Karta" : "Card",
    other: language === "uz" ? "Boshqa" : "Other",
    status: language === "uz" ? "Holat" : "Status",
    paid: language === "uz" ? "To'langan" : "Paid",
    partial: language === "uz" ? "Qisman to'langan" : "Partially paid",
    unpaid: language === "uz" ? "To'lanmagan" : "Unpaid",
    reset: language === "uz" ? "Filtrlarni tiklash" : "Reset filters",
    from: language === "uz" ? "Dan" : "From",
    to: language === "uz" ? "Gacha" : "To",
  };

  return (
    <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-[240px] flex-1 flex-col gap-1">
          <Label htmlFor="purchaseSearch">{tr.search}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="purchaseSearch"
              placeholder={tr.searchPlaceholder}
              className="pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-[140px] flex-col gap-1">
            <Label>{tr.dateRange}</Label>
            <Select value={dateRange} onValueChange={(value) => onDateRangeChange(value as DateRangeValue)}>
              <SelectTrigger className="w-auto min-w-[140px]">
                <SelectValue placeholder={tr.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.all}</SelectItem>
                <SelectItem value="today">{tr.today}</SelectItem>
                <SelectItem value="week">{tr.week}</SelectItem>
                <SelectItem value="month">{tr.month}</SelectItem>
                <SelectItem value="custom">{tr.custom}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-[140px] flex-col gap-1">
            <Label>{tr.paymentType}</Label>
            <Select
              value={paymentType}
              onValueChange={(value) => onPaymentTypeChange(value as PaymentTypeValue)}
            >
              <SelectTrigger className="w-auto min-w-[140px]">
                <SelectValue placeholder={tr.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.all}</SelectItem>
                <SelectItem value="PAID_NOW">{tr.paidNow}</SelectItem>
                <SelectItem value="PAY_LATER">{tr.payLater}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-[120px] flex-col gap-1">
            <Label>{tr.method}</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value) => onPaymentMethodChange(value as PaymentMethodValue)}
            >
              <SelectTrigger className="w-auto min-w-[120px]">
                <SelectValue placeholder={tr.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.all}</SelectItem>
                <SelectItem value="CASH">{tr.cash}</SelectItem>
                <SelectItem value="CARD">{tr.card}</SelectItem>
                <SelectItem value="OTHER">{tr.other}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-[160px] flex-col gap-1">
            <Label>{tr.status}</Label>
            <Select value={status} onValueChange={(value) => onStatusChange(value as StatusValue)}>
              <SelectTrigger className="w-auto min-w-[160px]">
                <SelectValue placeholder={tr.all} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.all}</SelectItem>
                <SelectItem value="paid">{tr.paid}</SelectItem>
                <SelectItem value="partial">{tr.partial}</SelectItem>
                <SelectItem value="unpaid">{tr.unpaid}</SelectItem>
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

      {dateRange === "custom" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="purchaseCustomFrom">{tr.from}</Label>
            <Input
              id="purchaseCustomFrom"
              type="datetime-local"
              value={customFrom}
              onChange={(event) => onCustomFromChange(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="purchaseCustomTo">{tr.to}</Label>
            <Input
              id="purchaseCustomTo"
              type="datetime-local"
              value={customTo}
              onChange={(event) => onCustomToChange(event.target.value)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
