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
    searchPlaceholder:
      language === "uz" ? "Qidirish: xodim ismi yoki roli..." : "Search: worker name or role...",
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
    reset: language === "uz" ? "Tiklash" : "Reset",
  };

  return (
    <Card className="rounded-3xl">
      <CardContent>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Input
              placeholder={tr.searchPlaceholder}
              value={value.q}
              onChange={(e) => onChange({ ...value, q: e.target.value })}
              className="h-10 rounded-2xl"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Input
              value={value.month}
              onChange={(e) => onChange({ ...value, month: e.target.value })}
              className="h-10 w-[140px] rounded-2xl"
              placeholder="YYYY-MM"
            />

            <Select
              value={value.role}
              onValueChange={(v) => onChange({ ...value, role: v as WorkerRoleFilter })}
            >
              <SelectTrigger className="h-10 w-[160px] rounded-2xl">
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

            <Select
              value={value.status}
              onValueChange={(v) => onChange({ ...value, status: v as WorkerPayStatusFilter })}
            >
              <SelectTrigger className="h-10 w-[150px] rounded-2xl">
                <SelectValue placeholder={tr.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{tr.allStatus}</SelectItem>
                <SelectItem value="PAID">{tr.paid}</SelectItem>
                <SelectItem value="PARTIAL">{tr.partial}</SelectItem>
                <SelectItem value="UNPAID">{tr.unpaid}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="h-10 rounded-2xl"
              onClick={() =>
                onChange({
                  q: "",
                  month: "2026-02",
                  role: "ALL",
                  status: "ALL",
                })
              }
            >
              <X className="mr-2 h-4 w-4" />
              {tr.reset}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
