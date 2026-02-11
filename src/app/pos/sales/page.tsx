import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SalesPageHeader } from "./components/sales-header";
import { SalesFilters } from "./components/sales-filters";
import { SalesTable, type SaleRow } from "./components/sales-table";
import { SaleDetailsModal } from "./modals/sale-details-modal";
import { NewSaleModal } from "./modals/new-sale-modal";
import { EditSaleModal } from "./modals/edit-sale-modal";
import { AddPaymentModal } from "./modals/add-payment-modal";
import {
  addSalePayment,
  ApiRequestError,
  createSale,
  deleteSale,
  getSale,
  listSales,
  SALE_DELETE_SUPPORTED,
  type CreateSalePayload,
  type SaleDetail,
  type SaleListItem,
  type SalePaymentType,
  type UpdateSalePayload,
  updateSale,
} from "@/lib/api/sales";
import { canManageSales, canViewSales } from "@/lib/auth/permissions";
import { useI18n } from "@/lib/i18n/provider";
import { useAppSelector } from "@/store/hooks";

const PAGE_LIMIT = 10;

function formatDateOnly(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toRowStatus(total: number, remaining: number): SaleRow["status"] {
  if (remaining <= 0) return "PAID";
  if (remaining >= total) return "UNPAID";
  return "PARTIAL";
}

function toSaleRow(item: SaleListItem): SaleRow {
  const total = Number(item.totalPrice ?? 0);
  const paidNow = Number(item.paidNow ?? 0);
  const remaining = Number(item.remaining ?? 0);

  return {
    id: String(item.id),
    soldDate: formatDateOnly(item.soldAt),
    phoneLabel: item.phoneLabel ?? undefined,
    customerName:
      item.customer?.fullName ??
      (item.customerId ? `Customer #${item.customerId}` : undefined),
    customerPhone: item.customer?.phoneNumber ?? undefined,
    itemsCount: item.itemsCount ?? 0,
    total,
    paidNow,
    remaining,
    paymentType: item.paymentType,
    paymentMethod: item.paymentMethod,
    status: toRowStatus(total, remaining),
    notes: item.notes ?? undefined,
  };
}

export default function Sales() {
  const { language } = useI18n();
  const currentRole = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageSales(currentRole);
  const canView = canViewSales(currentRole);
  const canDelete =
    (currentRole === "OWNER_ADMIN" || currentRole === "ADMIN") &&
    SALE_DELETE_SUPPORTED;

  const [rows, setRows] = useState<SaleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentType, setPaymentType] = useState<"all" | SalePaymentType>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [newOpen, setNewOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<SaleDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SaleRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const pushToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;

    setToastVisible(false);
    const enterTimer = window.setTimeout(() => setToastVisible(true), 20);
    const leaveTimer = window.setTimeout(() => setToastVisible(false), 2400);
    const removeTimer = window.setTimeout(() => setToast(null), 2750);

    return () => {
      window.clearTimeout(enterTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [toast]);

  const loadSales = useCallback(async () => {
    if (!canView) {
      setRows([]);
      setError("Not allowed");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await listSales({
        page,
        limit: PAGE_LIMIT,
        paymentType: paymentType === "all" ? undefined : paymentType,
        from: dateFrom ? new Date(dateFrom).toISOString() : undefined,
        to: dateTo ? new Date(`${dateTo}T23:59:59`).toISOString() : undefined,
      });

      setRows((response.data ?? []).map(toSaleRow));
      setTotal(response.meta?.total ?? response.data.length);
      setTotalPages(response.meta?.totalPages ?? 1);
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.status === 401) {
        setError("Session expired. Please sign in again.");
      } else {
        setError(
          requestError instanceof Error ? requestError.message : "Failed to load sales",
        );
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [canView, page, paymentType, dateFrom, dateTo]);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return rows;
    }

    return rows.filter((row) => {
      const text = [
        row.id,
        row.customerName ?? "",
        row.customerPhone ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(keyword);
    });
  }, [rows, search]);

  function guardManageAction(): boolean {
    if (canManage) return false;
    pushToast("error", "Not allowed");
    return true;
  }

  function printReceipt(detail: SaleDetail): void {
    const receiptWindow = window.open("", "_blank", "width=720,height=900");
    if (!receiptWindow) return;

    const total = Number(detail.totalPrice ?? 0);
    const paidNow = Number(detail.paidNow ?? 0);
    const remaining = Number(detail.remaining ?? 0);
    const paymentMethodLabel =
      detail.paymentMethod === "CASH"
        ? language === "uz"
          ? "Naqd"
          : "Cash"
        : detail.paymentMethod === "CARD"
          ? language === "uz"
            ? "Karta"
            : "Card"
          : language === "uz"
            ? "Boshqa"
            : "Other";

    const rowsHtml = detail.items
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${item.item.brand} ${item.item.model}</td>
            <td>${item.item.imei}</td>
            <td>${Math.round(Number(item.salePrice)).toLocaleString("en-US")} so'm</td>
          </tr>
        `,
      )
      .join("");

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Sale Receipt #${detail.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { font-size: 20px; margin: 0 0 8px 0; }
            p { margin: 4px 0; font-size: 13px; }
            .meta { margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; text-align: left; }
            th { background: #f5f5f5; }
            .totals { margin-top: 16px; }
            .totals p { font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>${language === "uz" ? "Sotuv cheki" : "Sale Receipt"} #${detail.id}</h1>
          <div class="meta">
            <p>${language === "uz" ? "Sana" : "Date"}: ${detail.soldAt}</p>
            <p>${language === "uz" ? "Mijoz" : "Customer"}: ${detail.customer?.fullName ?? "-"}</p>
            <p>${language === "uz" ? "Telefon" : "Phone"}: ${detail.customer?.phoneNumber ?? "-"}</p>
            <p>${language === "uz" ? "To'lov usuli" : "Payment method"}: ${paymentMethodLabel}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>${language === "uz" ? "Telefon" : "Phone"}</th>
                <th>IMEI</th>
                <th>${language === "uz" ? "Narx" : "Price"}</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <div class="totals">
            <p><strong>${language === "uz" ? "Jami" : "Total"}:</strong> ${Math.max(0, Math.round(total)).toLocaleString("en-US")} so'm</p>
            <p><strong>${language === "uz" ? "To'langan" : "Paid"}:</strong> ${Math.max(0, Math.round(paidNow)).toLocaleString("en-US")} so'm</p>
            <p><strong>${language === "uz" ? "Qolgan" : "Remaining"}:</strong> ${Math.max(0, Math.round(remaining)).toLocaleString("en-US")} so'm</p>
          </div>
          <script>
            window.onload = function () { window.print(); }
          </script>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  }

  async function openDetails(row: SaleRow): Promise<void> {
    try {
      const detail = await getSale(Number(row.id));
      setSelectedDetail(detail);
      setDetailsOpen(true);
    } catch (requestError) {
      pushToast(
        "error",
        requestError instanceof Error
          ? requestError.message
          : "Failed to load sale details",
      );
    }
  }

  async function handleCreate(payload: CreateSalePayload): Promise<void> {
    if (guardManageAction()) return;
    await createSale(payload);
    pushToast("success", "Sale created");
    await loadSales();
  }

  async function handleUpdate(id: number, payload: UpdateSalePayload): Promise<void> {
    if (guardManageAction()) return;
    const updated = await updateSale(id, payload);
    setSelectedDetail(updated);
    pushToast("success", "Sale updated");
    await loadSales();
  }

  async function handleDelete(row: SaleRow): Promise<void> {
    if (guardManageAction()) return;
    if (!canDelete) return;
    setDeleteTarget(row);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteSale(Number(deleteTarget.id));
      pushToast("success", "Sale deleted");
      setDeleteTarget(null);
      await loadSales();
    } catch (requestError) {
      pushToast(
        "error",
        requestError instanceof Error ? requestError.message : "Failed to delete sale",
      );
    } finally {
      setDeleting(false);
    }
  }

  async function handleAddPayment(id: number, amount: number): Promise<void> {
    if (guardManageAction()) return;
    const updated = await addSalePayment(id, { amount });
    setSelectedDetail(updated);
    pushToast("success", "Payment added");
    await loadSales();
  }

  return (
    <div className="space-y-6">
      <SalesPageHeader
        canCreate={canManage}
        onNewSale={() => {
          if (guardManageAction()) return;
          setNewOpen(true);
        }}
      />

      <SalesFilters
        search={search}
        onSearchChange={setSearch}
        paymentType={paymentType}
        onPaymentTypeChange={setPaymentType}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReset={() => {
          setSearch("");
          setPaymentType("all");
          setDateFrom("");
          setDateTo("");
          setPage(1);
        }}
      />

      <SalesTable
        rows={filteredRows}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        canManage={canManage}
        canDelete={canDelete}
        onPageChange={setPage}
        onRowClick={(row) => {
          void openDetails(row);
        }}
        onViewDetails={(row) => {
          void openDetails(row);
        }}
        onEdit={(row) => {
          if (guardManageAction()) return;
          void (async () => {
            try {
              const detail = await getSale(Number(row.id));
              setSelectedDetail(detail);
              setEditOpen(true);
            } catch (requestError) {
              pushToast(
                "error",
                requestError instanceof Error
                  ? requestError.message
                  : "Failed to load sale for edit",
              );
            }
          })();
        }}
        onAddPayment={(row) => {
          if (guardManageAction()) return;
          void (async () => {
            try {
              const detail = await getSale(Number(row.id));
              setSelectedDetail(detail);
              setPaymentOpen(true);
            } catch (requestError) {
              pushToast(
                "error",
                requestError instanceof Error
                  ? requestError.message
                  : "Failed to load sale for payment",
              );
            }
          })();
        }}
        onDelete={(row) => {
          void handleDelete(row);
        }}
        onReceipt={(row) => {
          void (async () => {
            try {
              const detail = await getSale(Number(row.id));
              printReceipt(detail);
            } catch (requestError) {
              pushToast(
                "error",
                requestError instanceof Error
                  ? requestError.message
                  : "Failed to generate receipt",
              );
            }
          })();
        }}
      />

      <SaleDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        sale={selectedDetail}
        canManage={canManage}
        onEdit={(sale) => {
          if (guardManageAction()) return;
          setSelectedDetail(sale);
          setDetailsOpen(false);
          setEditOpen(true);
        }}
        onAddPayment={(sale) => {
          if (guardManageAction()) return;
          setSelectedDetail(sale);
          setDetailsOpen(false);
          setPaymentOpen(true);
        }}
      />

      <EditSaleModal
        open={editOpen}
        onOpenChange={setEditOpen}
        canManage={canManage}
        sale={selectedDetail}
        onSubmit={handleUpdate}
      />

      <NewSaleModal
        open={newOpen}
        onOpenChange={(nextOpen) => {
          if (!canManage && nextOpen) {
            pushToast("error", "Not allowed");
            return;
          }
          setNewOpen(nextOpen);
        }}
        canManage={canManage}
        onSubmit={handleCreate}
      />

      <AddPaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        sale={selectedDetail}
        onSubmit={handleAddPayment}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next && !deleting) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>{language === "uz" ? "Sotuvni o'chirish" : "Delete sale"}</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? language === "uz"
                  ? `Haqiqatan ham #${deleteTarget.id} sotuvini o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.`
                  : `Are you sure you want to delete sale #${deleteTarget.id}? This action cannot be undone.`
                : language === "uz"
                  ? "Ishonchingiz komilmi?"
                  : "Are you sure?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {language === "uz" ? "Bekor qilish" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              className="rounded-2xl"
              onClick={() => void handleConfirmDelete()}
              disabled={deleting}
            >
              {deleting
                ? language === "uz"
                  ? "O'chirilmoqda..."
                  : "Deleting..."
                : language === "uz"
                  ? "O'chirish"
                  : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast
        ? createPortal(
            <div
              className={`fixed bottom-5 right-5 z-[9999] transition-all duration-300 ease-out ${
                toastVisible ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
              }`}
            >
              <div className="rounded-xl border border-emerald-500 bg-white px-4 py-3 text-sm text-emerald-700 shadow-lg dark:bg-background">
                {toast.message}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
