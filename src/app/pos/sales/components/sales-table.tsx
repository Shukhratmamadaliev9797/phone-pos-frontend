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
  MoreHorizontal,
  Eye,
  Pencil,
  HandCoins,
  Printer,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

export type SaleRow = {
  id: string;
  soldDate: string;
  phoneLabel?: string;
  customerName?: string;
  customerPhone?: string;
  itemsCount: number;
  total: number;
  paidNow: number;
  remaining: number;
  paymentType: "PAID_NOW" | "PAY_LATER";
  paymentMethod: "CASH" | "CARD" | "OTHER";
  status: "PAID" | "PARTIAL" | "UNPAID";
  notes?: string;
};

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

function statusBadge(status: SaleRow["status"], language: "en" | "uz") {
  if (status === "PAID") {
    return (
      <Badge
        className={cn(
          "rounded-full",
          "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15",
        )}
      >
        {language === "uz" ? "To'langan" : "Paid"}
      </Badge>
    );
  }
  if (status === "PARTIAL") {
    return (
      <Badge
        className={cn(
          "rounded-full",
          "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15",
        )}
      >
        {language === "uz" ? "Qisman" : "Partial"}
      </Badge>
    );
  }
  return (
    <Badge
      className={cn(
        "rounded-full",
        "bg-rose-500/15 text-rose-700 hover:bg-rose-500/15",
      )}
    >
      {language === "uz" ? "To'lanmagan" : "Unpaid"}
    </Badge>
  );
}

function paymentTypeBadge(t: SaleRow["paymentType"], language: "en" | "uz") {
  return t === "PAID_NOW" ? (
    <Badge variant="secondary" className="rounded-full">
      {language === "uz" ? "Hozir to'langan" : "Paid now"}
    </Badge>
  ) : (
    <Badge variant="secondary" className="rounded-full">
      {language === "uz" ? "Keyin to'lash" : "Pay later"}
    </Badge>
  );
}

export function SalesTable({
  rows,
  loading,
  error,
  page,
  totalPages,
  total,
  canManage,
  canDelete,
  onPageChange,
  onRowClick,
  onViewDetails,
  onEdit,
  onAddPayment,
  onReceipt,
  onDelete,
}: {
  rows: SaleRow[];
  loading?: boolean;
  error?: string | null;
  page: number;
  totalPages: number;
  total: number;
  canManage: boolean;
  canDelete: boolean;
  onPageChange: (nextPage: number) => void;
  onRowClick?: (row: SaleRow) => void;
  onViewDetails?: (row: SaleRow) => void;
  onEdit?: (row: SaleRow) => void;
  onAddPayment?: (row: SaleRow) => void;
  onReceipt?: (row: SaleRow) => void;
  onDelete?: (row: SaleRow) => void;
}) {
  const { language } = useI18n();
  const shown = rows.length;
  const pageNumbers = Array.from(
    { length: Math.max(totalPages, 1) },
    (_, index) => index + 1,
  );
  return (
    <div className="rounded-3xl border border-muted/40 bg-muted/30 p-2">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">
                {language === "uz" ? "Sana" : "Date"}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {language === "uz" ? "Telefon" : "Phone"}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {language === "uz" ? "Mijoz" : "Customer"}
              </TableHead>
              <TableHead className="whitespace-nowrap text-right">
                {language === "uz" ? "Soni" : "Items"}
              </TableHead>
              <TableHead className="whitespace-nowrap text-right">
                {language === "uz" ? "Jami" : "Total"}
              </TableHead>
              <TableHead className="whitespace-nowrap text-right">
                {language === "uz" ? "To'langan" : "Paid"}
              </TableHead>
              <TableHead className="whitespace-nowrap text-right">
                {language === "uz" ? "Qolgan" : "Remaining"}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {language === "uz" ? "Turi" : "Type"}
              </TableHead>
              <TableHead className="whitespace-nowrap">
                {language === "uz" ? "Holat" : "Status"}
              </TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {language === "uz"
                    ? "Sotuvlar yuklanmoqda..."
                    : "Loading sales..."}
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && error ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-10 text-center text-sm text-rose-600"
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : null}

            {!loading && !error
              ? rows.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => onRowClick?.(r)}
                  >
                    <TableCell className="whitespace-nowrap">
                      <div className="text-sm font-medium">{r.soldDate}</div>
                    </TableCell>

                    <TableCell className="min-w-[220px]">
                      <div className="text-sm font-medium">
                        {r.phoneLabel || ""}
                      </div>
                    </TableCell>

                    <TableCell className="min-w-[220px]">
                      <div className="text-sm font-medium">
                        {r.customerName || ""}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.customerPhone || "—"}
                      </div>
                    </TableCell>

                    <TableCell className="text-right">{r.itemsCount}</TableCell>
                    <TableCell className="text-right">
                      {money(r.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      {money(r.paidNow)}
                    </TableCell>
                    <TableCell className="text-right">
                      {money(r.remaining)}
                    </TableCell>

                    <TableCell>
                      {paymentTypeBadge(r.paymentType, language)}
                    </TableCell>
                    <TableCell>{statusBadge(r.status, language)}</TableCell>

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
                              {language === "uz" ? "Tahrirlash" : "Edit"}
                            </DropdownMenuItem>
                          ) : null}
                          {canManage && r.remaining > 0 ? (
                            <DropdownMenuItem onClick={() => onAddPayment?.(r)}>
                              <HandCoins className="mr-2 h-4 w-4" />
                              {language === "uz"
                                ? "To'lov qo'shish"
                                : "Add payment"}
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => onReceipt?.(r)}>
                            <Printer className="mr-2 h-4 w-4" />
                            {language === "uz" ? "Chek" : "Receipt"}
                          </DropdownMenuItem>
                          {canDelete ? (
                            <DropdownMenuItem
                              className="text-rose-700 focus:text-rose-700"
                              onClick={() => onDelete?.(r)}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              {language === "uz" ? "O'chirish" : "Delete"}
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!loading && !error && rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  {language === "uz"
                    ? "Sotuvlar topilmadi."
                    : "No sales found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-muted/40 bg-background/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {language === "uz" ? "Ko'rsatilgan" : "Showing"}{" "}
            <span className="font-medium text-foreground">{shown}</span> /{" "}
            <span className="font-medium text-foreground">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-xl px-3"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              {language === "uz" ? "Oldingi" : "Prev"}
            </Button>

            <div className="hidden items-center gap-1 sm:flex">
              {pageNumbers.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === page ? "default" : "outline"}
                  size="sm"
                  className="h-8 min-w-8 rounded-xl px-2"
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-xl px-3"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {language === "uz" ? "Keyingi" : "Next"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
