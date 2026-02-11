import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useI18n } from "@/lib/i18n/provider";
import type { CustomerRow } from "../types";

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

function debtBadge(v: number) {
  return (
    <Badge
      className={cn(
        "rounded-full",
        v > 0
          ? "bg-rose-500/15 text-rose-700 hover:bg-rose-500/15"
          : "bg-muted text-muted-foreground",
      )}
    >
      {money(v)}
    </Badge>
  );
}

function creditBadge(v: number) {
  return (
    <Badge
      className={cn(
        "rounded-full",
        v > 0
          ? "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15"
          : "bg-muted text-muted-foreground",
      )}
    >
      {money(v)}
    </Badge>
  );
}

function customerTypeBadge(row: CustomerRow, language: "en" | "uz") {
  const hasBought = Boolean(row.purchasedPhones && row.purchasedPhones !== "—");
  const hasSold = Boolean(row.soldPhones && row.soldPhones !== "—");

  if (hasBought && hasSold) {
    return (
      <Badge className="rounded-full bg-sky-500/15 text-sky-700 hover:bg-sky-500/15">
        {language === "uz" ? "Sotib olgan va sotgan" : "Bought & Sold"}
      </Badge>
    );
  }

  if (hasBought) {
    return (
      <Badge className="rounded-full bg-amber-500/15 text-amber-700 hover:bg-amber-500/15">
        {language === "uz" ? "Sotib olgan" : "Bought"}
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
      {language === "uz" ? "Sotgan" : "Sold"}
    </Badge>
  );
}

function balanceStatusBadge(row: CustomerRow, language: "en" | "uz") {
  const hasDebt = row.debt > 0;
  const hasCredit = row.credit > 0;

  if (hasDebt && hasCredit) {
    return (
      <Badge className="rounded-full bg-amber-500/15 text-amber-700 hover:bg-amber-500/15">
        {language === "uz" ? "Aralash" : "Mixed"}
      </Badge>
    );
  }

  if (hasDebt) {
    return (
      <Badge className="rounded-full bg-rose-500/15 text-rose-700 hover:bg-rose-500/15">
        {language === "uz" ? "Qarz" : "Debt"}
      </Badge>
    );
  }

  return (
    <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
      {language === "uz" ? "Kredit" : "Credit"}
    </Badge>
  );
}

export function CustomersTable({
  rows,
  loading,
  error,
  page,
  totalPages,
  total,
  canManage,
  onPageChange,
  onRowClick,
  onViewDetails,
  onEdit,
}: {
  rows: CustomerRow[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  canManage: boolean;
  onPageChange: (nextPage: number) => void;
  onRowClick?: (row: CustomerRow) => void;
  onViewDetails?: (row: CustomerRow) => void;
  onEdit?: (row: CustomerRow) => void;
}) {
  const { language } = useI18n();
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="p-1">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap py-2">
                  {language === "uz" ? "Turi" : "Type"}
                </TableHead>
                <TableHead className="py-2">
                  {language === "uz" ? "Mijoz" : "Customer"}
                </TableHead>
                <TableHead className="min-w-[220px] py-2">
                  {language === "uz" ? "Telefonlar" : "Phones"}
                </TableHead>
                <TableHead className="whitespace-nowrap py-2">
                  {language === "uz" ? "Dokon Qarz" : "Shop Debt"}
                </TableHead>
                <TableHead className="whitespace-nowrap py-2">
                  {language === "uz" ? "Mijoz Qarz" : "Customer Debt"}
                </TableHead>
                <TableHead className="whitespace-nowrap py-2">
                  {language === "uz" ? "Holat" : "Status"}
                </TableHead>
                <TableHead className="whitespace-nowrap py-2">
                  {language === "uz" ? "Jami narx" : "Total price"}
                </TableHead>
                <TableHead className="whitespace-nowrap py-2">
                  {language === "uz" ? "Oxirgi to'lov" : "Last payment"}
                </TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.customer.id}
                  className="cursor-pointer border-b border-muted/40 last:border-b-0"
                  onClick={() => onRowClick?.(r)}
                >
                  <TableCell className="whitespace-nowrap py-2">
                    {customerTypeBadge(r, language)}
                  </TableCell>
                  <TableCell className="min-w-[260px] py-2">
                    <div className="text-sm font-semibold">
                      {r.customer.fullName || "—"}
                    </div>
                  </TableCell>

                  <TableCell className="min-w-[220px] py-2 text-xs text-muted-foreground">
                    <div className="text-sm text-foreground">
                      {r.soldPhones && r.purchasedPhones
                        ? `${r.soldPhones}, ${r.purchasedPhones}`
                        : r.soldPhones || r.purchasedPhones || "—"}
                    </div>
                  </TableCell>

                  <TableCell className="py-2">{debtBadge(r.debt)}</TableCell>
                  <TableCell className="py-2">
                    {creditBadge(r.credit)}
                  </TableCell>
                  <TableCell className="py-2">
                    {balanceStatusBadge(r, language)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap py-2 text-sm text-muted-foreground">
                    {money(r.totalDue ?? r.debt + r.credit)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap py-2 text-sm text-muted-foreground">
                    {r.lastPaymentAmount !== undefined
                      ? `${money(r.lastPaymentAmount)}${
                          r.lastPaymentAt
                            ? ` • ${new Date(r.lastPaymentAt).toLocaleDateString()}`
                            : ""
                        }`
                      : "—"}
                  </TableCell>

                  <TableCell onClick={(e) => e.stopPropagation()}>
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

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => onViewDetails?.(r)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {language === "uz"
                            ? "Batafsil ko'rish"
                            : "View details"}
                        </DropdownMenuItem>
                        {canManage ? (
                          <DropdownMenuItem onClick={() => onEdit?.(r)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {language === "uz"
                              ? "Mijozni tahrirlash"
                              : "Edit customer"}
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {error ??
                      (language === "uz"
                        ? "Mijozlar topilmadi."
                        : "No customers found.")}
                  </TableCell>
                </TableRow>
              ) : null}

              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {language === "uz"
                      ? "Mijozlar yuklanmoqda..."
                      : "Loading customers..."}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {totalPages > 1 ? (
        <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {language === "uz" ? "Jami" : "Total"}{" "}
            <span className="font-medium text-foreground">{total}</span>{" "}
            {language === "uz" ? "ta yozuv" : "records"}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              {language === "uz" ? "Oldingi" : "Prev"}
            </Button>

            <div className="min-w-[80px] text-center text-xs text-muted-foreground">
              {language === "uz" ? "Sahifa" : "Page"}{" "}
              <span className="font-medium text-foreground">{page}</span> /{" "}
              <span className="font-medium text-foreground">{totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl"
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
              {language === "uz" ? "Keyingi" : "Next"}
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
