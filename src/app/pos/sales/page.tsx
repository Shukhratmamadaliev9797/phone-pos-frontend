import { useCallback, useEffect, useMemo, useState } from "react";
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

    const confirmed = window.confirm(`Delete sale #${row.id}?`);
    if (!confirmed) return;

    await deleteSale(Number(row.id));
    pushToast("success", "Sale deleted");
    await loadSales();
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
        canManage={canManage}
        canDelete={canDelete}
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
      />

      <div className="flex justify-end text-xs text-muted-foreground">
        Page {page} / {totalPages} • {filteredRows.length} shown • {total} total
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded-xl border px-3 py-1 text-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <button
          type="button"
          className="rounded-xl border px-3 py-1 text-sm disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>

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

      {toast ? (
        <div
          className={`fixed right-5 top-5 z-[90] transition-all duration-300 ease-out ${
            toastVisible ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0"
          }`}
        >
          <div
            className={`rounded-xl px-4 py-3 text-sm text-white shadow-lg ${
              toast.type === "success" ? "bg-emerald-600" : "bg-rose-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </div>
  );
}
