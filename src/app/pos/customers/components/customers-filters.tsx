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
    searchPlaceholder:
      language === "uz" ? "Qidirish: telefon raqami, to'liq ism..." : "Search: phone number, full name...",
    show: language === "uz" ? "Ko'rsatish" : "Show",
    all: language === "uz" ? "Barchasi" : "All",
    withDebt: language === "uz" ? "Qarzli" : "With Debt",
    withCredit: language === "uz" ? "Kreditli" : "With Credit",
    reset: language === "uz" ? "Tiklash" : "Reset",
  };

  return (
    <Card className="rounded-3xl">
      <CardContent>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              placeholder={tr.searchPlaceholder}
              className="h-10 rounded-2xl"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Select
              value={type}
              onValueChange={(value) => onTypeChange(value as CustomerBalanceType)}
            >
              <SelectTrigger className="h-10 w-[170px] rounded-2xl">
                <SelectValue placeholder={tr.show} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.all}</SelectItem>
                <SelectItem value="debt">{tr.withDebt}</SelectItem>
                <SelectItem value="credit">{tr.withCredit}</SelectItem>
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
