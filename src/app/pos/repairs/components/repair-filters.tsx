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
import { useI18n } from "@/lib/i18n/provider";

export function RepairsFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onReset,
}: {
  search: string;
  status: "all" | "PENDING" | "DONE";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | "PENDING" | "DONE") => void;
  onReset: () => void;
}) {
  const { language } = useI18n();
  const tr = {
    search: language === "uz" ? "Qidirish" : "Search",
    searchPlaceholder:
      language === "uz"
        ? "Qidirish: IMEI/serial, brand/model, repair ID, texnik..."
        : "Search: IMEI/serial, brand/model, repair ID, technician...",
    status: language === "uz" ? "Holat" : "Status",
    allStatus: language === "uz" ? "Barcha holatlar" : "All status",
    pending: language === "uz" ? "Kutilmoqda" : "Pending",
    done: language === "uz" ? "Bajarilgan" : "Done",
    reset: language === "uz" ? "Filtrlarni tiklash" : "Reset filters",
  };

  return (
    <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-[240px] flex-1 flex-col gap-1">
          <Label htmlFor="repairSearch">{tr.search}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="repairSearch"
              placeholder={tr.searchPlaceholder}
              className="pl-9"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-[160px] flex-col gap-1">
            <Label>{tr.status}</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                onStatusChange(value as "all" | "PENDING" | "DONE")
              }
            >
              <SelectTrigger className="w-auto min-w-[160px]">
                <SelectValue placeholder={tr.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.allStatus}</SelectItem>
                <SelectItem value="PENDING">{tr.pending}</SelectItem>
                <SelectItem value="DONE">{tr.done}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" className="h-10 px-3" title={tr.reset} onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
