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

export type WorkerRole = "ADMIN" | "CASHIER" | "TECHNICIAN" | "CLEANER" | "ACCOUNTANT";
export type WorkerRoleFilter = "ALL" | WorkerRole;
export type WorkerPayStatus = "PAID" | "PARTIAL" | "UNPAID";
export type WorkerPayStatusFilter = "ALL" | WorkerPayStatus;

export type WorkersFiltersValue = {
  q: string;
  month: string; // "YYYY-MM"
  role: WorkerRoleFilter;
  status: WorkerPayStatusFilter;
};

export function WorkersFilters({
  value,
  onChange,
}: {
  value: WorkersFiltersValue;
  onChange: (v: WorkersFiltersValue) => void;
}) {
  const { language } = useI18n();
  const tr = {
    search: language === "uz" ? "Qidirish" : "Search",
    searchPlaceholder:
      language === "uz" ? "Qidirish: xodim ismi yoki roli..." : "Search: worker name or role...",
    month: language === "uz" ? "Oy (YYYY-MM)" : "Month (YYYY-MM)",
    role: language === "uz" ? "Rol" : "Role",
    status: language === "uz" ? "Holat" : "Status",
    allRoles: language === "uz" ? "Barcha rollar" : "All roles",
    admin: language === "uz" ? "Admin" : "Admin",
    cashier: language === "uz" ? "Kassir" : "Cashier",
    technician: language === "uz" ? "Texnik" : "Technician",
    cleaner: language === "uz" ? "Tozalovchi" : "Cleaner",
    accountant: language === "uz" ? "Buxgalter" : "Accountant",
    allStatus: language === "uz" ? "Barcha holatlar" : "All status",
    paid: language === "uz" ? "To'langan" : "Paid",
    partial: language === "uz" ? "Qisman" : "Partial",
    unpaid: language === "uz" ? "To'lanmagan" : "Unpaid",
    reset: language === "uz" ? "Filtrlarni tiklash" : "Reset filters",
  };

  return (
    <div className="rounded-2xl border border-muted/40 bg-muted/30 p-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-[240px] flex-1 flex-col gap-1">
          <Label htmlFor="workersSearch">{tr.search}</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="workersSearch"
              placeholder={tr.searchPlaceholder}
              value={value.q}
              onChange={(e) => onChange({ ...value, q: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <div className="flex min-w-[140px] flex-col gap-1">
            <Label>{tr.month}</Label>
            <Input
              value={value.month}
              onChange={(e) => onChange({ ...value, month: e.target.value })}
              className="h-10 w-[140px]"
              placeholder="YYYY-MM"
            />
          </div>

          <div className="flex min-w-[160px] flex-col gap-1">
            <Label>{tr.role}</Label>
            <Select
              value={value.role}
              onValueChange={(v) => onChange({ ...value, role: v as WorkerRoleFilter })}
            >
              <SelectTrigger className="h-10 w-auto min-w-[160px]">
                <SelectValue placeholder={tr.role} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tr.allRoles}</SelectItem>
                <SelectItem value="ADMIN">{tr.admin}</SelectItem>
                <SelectItem value="CASHIER">{tr.cashier}</SelectItem>
                <SelectItem value="TECHNICIAN">{tr.technician}</SelectItem>
                <SelectItem value="CLEANER">{tr.cleaner}</SelectItem>
                <SelectItem value="ACCOUNTANT">{tr.accountant}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex min-w-[150px] flex-col gap-1">
            <Label>{tr.status}</Label>
            <Select
              value={value.status}
              onValueChange={(v) => onChange({ ...value, status: v as WorkerPayStatusFilter })}
            >
              <SelectTrigger className="h-10 w-auto min-w-[150px]">
                <SelectValue placeholder={tr.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tr.allStatus}</SelectItem>
                <SelectItem value="PAID">{tr.paid}</SelectItem>
                <SelectItem value="PARTIAL">{tr.partial}</SelectItem>
                <SelectItem value="UNPAID">{tr.unpaid}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            className="h-10 px-3"
            title={tr.reset}
              onClick={() =>
                onChange({
                  q: "",
                  month: "2026-02",
                  role: "ALL",
                  status: "ALL",
                })
              }
            >
            <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
    </div>
  );
}
