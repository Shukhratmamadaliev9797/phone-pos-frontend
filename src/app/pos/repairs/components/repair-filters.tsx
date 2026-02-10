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
    searchPlaceholder:
      language === "uz"
        ? "Qidirish: IMEI/serial, brand/model, repair ID, texnik..."
        : "Search: IMEI/serial, brand/model, repair ID, technician...",
    status: language === "uz" ? "Holat" : "Status",
    allStatus: language === "uz" ? "Barcha holatlar" : "All status",
    pending: language === "uz" ? "Kutilmoqda" : "Pending",
    done: language === "uz" ? "Bajarilgan" : "Done",
    technician: language === "uz" ? "Texnik" : "Technician",
    allTech: language === "uz" ? "Barcha texniklar" : "All technicians",
    dateRange: language === "uz" ? "Sana oralig'i" : "Date range",
    today: language === "uz" ? "Bugun" : "Today",
    thisWeek: language === "uz" ? "Shu hafta" : "This week",
    custom: language === "uz" ? "Maxsus" : "Custom",
    min: language === "uz" ? "Min" : "Min",
    max: language === "uz" ? "Max" : "Max",
    reset: language === "uz" ? "Tiklash" : "Reset",
  };

  return (
    <Card className="rounded-3xl">
      <CardContent>
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
            {/* Status */}
            <Select
              value={status}
              onValueChange={(value) =>
                onStatusChange(value as "all" | "PENDING" | "DONE")
              }
            >
              <SelectTrigger className="h-10 w-[150px] rounded-2xl">
                <SelectValue placeholder={tr.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{tr.allStatus}</SelectItem>
                <SelectItem value="PENDING">{tr.pending}</SelectItem>
                <SelectItem value="DONE">{tr.done}</SelectItem>
              </SelectContent>
            </Select>

            {/* Technician */}
            <Select defaultValue="ALL" disabled>
              <SelectTrigger className="h-10 w-[170px] rounded-2xl">
                <SelectValue placeholder={tr.technician} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tr.allTech}</SelectItem>
                <SelectItem value="TECH_1">
                  {language === "uz" ? "Jasur (Texnik)" : "Jasur (Tech)"}
                </SelectItem>
                <SelectItem value="TECH_2">
                  {language === "uz" ? "Akmal (Texnik)" : "Akmal (Tech)"}
                </SelectItem>
                <SelectItem value="TECH_3">
                  {language === "uz" ? "Sherzod (Texnik)" : "Sherzod (Tech)"}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Date range */}
            <Select defaultValue="THIS_WEEK" disabled>
              <SelectTrigger className="h-10 w-[160px] rounded-2xl">
                <SelectValue placeholder={tr.dateRange} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAY">{tr.today}</SelectItem>
                <SelectItem value="THIS_WEEK">{tr.thisWeek}</SelectItem>
                <SelectItem value="CUSTOM">{tr.custom}</SelectItem>
              </SelectContent>
            </Select>

            {/* Optional: Cost range */}
            <div className="hidden xl:flex items-center gap-2">
              <Input
                inputMode="numeric"
                placeholder={tr.min}
                className="h-10 w-[110px] rounded-2xl"
                disabled
              />
              <Input
                inputMode="numeric"
                placeholder={tr.max}
                className="h-10 w-[110px] rounded-2xl"
                disabled
              />
            </div>

            {/* Reset */}
            <Button variant="outline" className="h-10 rounded-2xl" onClick={onReset}>
              <X className="mr-2 h-4 w-4" />
              {tr.reset}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
