import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export type WorkerRoleUi = "ADMIN" | "CASHIER" | "TECHNICIAN";
export type WorkerRoleDisplay =
  | WorkerRoleUi
  | "CLEANER"
  | "ACCOUNTANT"
  | "OTHER";
export type WorkerPayStatus = "PAID" | "PARTIAL" | "UNPAID";

export type WorkerRow = {
  id: number;
  fullName: string;
  phoneNumber: string;
  role: WorkerRoleDisplay;
  monthlySalary: number;
  monthPaid: number;
  monthRemaining: number;
  status: WorkerPayStatus;
  hasDashboardAccess: boolean;
  userId?: number | null;
  lastPaymentDate: string;
};

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

function statusPill(s: WorkerPayStatus) {
  if (s === "PAID")
    return "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15";
  if (s === "PARTIAL")
    return "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15";
  return "bg-rose-500/15 text-rose-700 hover:bg-rose-500/15";
}

function roleLabel(r: WorkerRoleDisplay, language: "en" | "uz") {
  if (r === "ADMIN") return language === "uz" ? "Admin" : "Admin";
  if (r === "CASHIER") return language === "uz" ? "Kassir" : "Cashier";
  if (r === "TECHNICIAN") return language === "uz" ? "Texnik" : "Technician";
  if (r === "CLEANER") return language === "uz" ? "Tozalovchi" : "Cleaner";
  if (r === "ACCOUNTANT") return language === "uz" ? "Buxgalter" : "Accountant";
  return language === "uz" ? "Boshqa" : "Other";
}

export function WorkersTable({
  rows,
  loading,
  error,
  canManage,
  onRowClick,
  onView,
  onPay,
  onDelete,
}: {
  rows: WorkerRow[];
  loading: boolean;
  error: string | null;
  canManage: boolean;
  onRowClick?: (row: WorkerRow) => void;
  onView?: (row: WorkerRow) => void;
  onPay?: (row: WorkerRow) => void;
  onDelete?: (row: WorkerRow) => void;
}) {
  const { language } = useI18n();
  return (
    <div className="rounded-3xl border border-muted/40 bg-muted/30 p-3">
      <div className="overflow-x-auto">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "uz" ? "Xodim" : "Worker"}</TableHead>
                <TableHead className="text-right">
                  {language === "uz" ? "Oylik ish haqi" : "Monthly salary"}
                </TableHead>
                <TableHead className="text-right">
                  {language === "uz" ? "To'langan (oy)" : "Paid (month)"}
                </TableHead>
                <TableHead className="text-right">
                  {language === "uz" ? "Qolgan" : "Remaining"}
                </TableHead>
                <TableHead>{language === "uz" ? "Holat" : "Status"}</TableHead>
                <TableHead>{language === "uz" ? "Rol" : "Role"}</TableHead>
                <TableHead>
                  {language === "uz" ? "Oxirgi to'lov" : "Last payment"}
                </TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn("cursor-pointer")}
                  onClick={() => onRowClick?.(row)}
                >
                  <TableCell>
                    <div className="font-medium">{row.fullName}</div>
                    <div className="text-xs text-muted-foreground">
                      {row.phoneNumber}
                    </div>
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    {money(row.monthlySalary)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {money(row.monthPaid)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {money(row.monthRemaining)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={cn("rounded-full", statusPill(row.status))}
                    >
                      {row.status === "PAID"
                        ? language === "uz"
                          ? "To'langan"
                          : "Paid"
                        : row.status === "PARTIAL"
                          ? language === "uz"
                            ? "Qisman"
                            : "Partial"
                          : language === "uz"
                            ? "To'lanmagan"
                            : "Unpaid"}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge variant="secondary" className="rounded-full">
                      {roleLabel(row.role, language)}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {row.lastPaymentDate}
                  </TableCell>

                  <TableCell
                    className="text-right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-2xl"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView?.(row)}>
                          {language === "uz"
                            ? "Batafsil ko'rish"
                            : "View details"}
                        </DropdownMenuItem>
                        {canManage ? (
                          <DropdownMenuItem onClick={() => onPay?.(row)}>
                            {language === "uz"
                              ? "Ish haqi to'lash"
                              : "Pay salary"}
                          </DropdownMenuItem>
                        ) : null}
                        {canManage ? (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete?.(row)}
                          >
                            {language === "uz" ? "O'chirish" : "Delete"}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {language === "uz"
                      ? "Xodimlar yuklanmoqda..."
                      : "Loading workers..."}
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {error ??
                      (language === "uz"
                        ? "Xodimlar topilmadi"
                        : "No workers found")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
