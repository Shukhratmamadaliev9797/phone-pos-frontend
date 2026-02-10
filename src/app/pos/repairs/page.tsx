import * as React from "react";
import { Navigate } from "react-router-dom";
import { RepairsFilters } from "./components/repair-filters";
import { RepairsPageHeader } from "./components/repair-header";
import { RepairsSummary } from "./components/repair-summary";
import { RepairsTable, type RepairRow } from "./components/repair-tables";
import { NewRepairModal } from "./modals/new-repair-modal";
import { RepairDetailsModal } from "./modals/repair-details-modal";
import {
  addRepairEntry,
  ApiRequestError,
  createRepairCase,
  getRepairCase,
  listRepairableInventory,
  listRepairs,
  updateRepairCase,
  type AddRepairEntryPayload,
  type CreateRepairCasePayload,
  type RepairDetail,
  type RepairInventoryItem,
  type RepairListItem,
  type RepairListParams,
  type UpdateRepairCasePayload,
} from "@/lib/api/repairs";
import { canManageRepairs, canViewRepairs } from "@/lib/auth/permissions";
import { useI18n } from "@/lib/i18n/provider";
import { useAppSelector } from "@/store/hooks";

const PAGE_LIMIT = 10;

function formatDateOnly(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toRepairRow(item: RepairListItem): RepairRow {
  const itemName = [item.item?.brand, item.item?.model].filter(Boolean).join(" ").trim();

  return {
    id: String(item.id),
    dateTime: formatDateOnly(item.repairedAt || item.createdAt),
    itemName: itemName || `#${item.itemId ?? item.item?.id ?? "—"}`,
    imei: item.item?.imei,
    technician: item.technician?.fullName || item.technician?.username || undefined,
    status: item.status === "DONE" ? "DONE" : "PENDING",
    totalCost: Number(item.costTotal ?? 0),
    partsCost: item.partsCost != null ? Number(item.partsCost) : undefined,
    laborCost: item.laborCost != null ? Number(item.laborCost) : undefined,
    notes: item.notes ?? item.description ?? undefined,
  };
}

export default function RepairsPage() {
  const { language } = useI18n();
  const currentRole = useAppSelector((state) => state.auth.user?.role);
  const currentUserId = useAppSelector((state) => Number(state.auth.user?.id));
  const canManage = canManageRepairs(currentRole);
  const canView = canViewRepairs(currentRole);

  const [rows, setRows] = React.useState<RepairRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchDebounced, setSearchDebounced] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "PENDING" | "DONE">("all");

  const [newOpen, setNewOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedDetail, setSelectedDetail] = React.useState<RepairDetail | null>(null);

  const [inventory, setInventory] = React.useState<RepairInventoryItem[]>([]);
  const [inventoryLoading, setInventoryLoading] = React.useState(false);
  const [inventoryError, setInventoryError] = React.useState<string | null>(null);

  const [toast, setToast] = React.useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [toastVisible, setToastVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSearchDebounced(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  React.useEffect(() => {
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

  const pushToast = React.useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
  }, []);

  const loadRepairs = React.useCallback(async () => {
    if (!canView) {
      setRows([]);
      setError(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params: RepairListParams = {
        page,
        limit: PAGE_LIMIT,
        search: searchDebounced || undefined,
        status: status === "all" ? undefined : status,
      };

      const response = await listRepairs(params);
      setRows((response.data ?? []).map(toRepairRow));
      setTotal(response.meta?.total ?? response.data.length);
      setTotalPages(response.meta?.totalPages ?? 1);
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.status === 401) {
        setError(
          language === "uz"
            ? "Sessiya tugadi. Qayta tizimga kiring."
            : "Session expired. Please sign in again.",
        );
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : language === "uz"
              ? "Ta'mirlarni yuklab bo'lmadi"
              : "Failed to load repairs",
        );
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [canView, language, page, searchDebounced, status]);

  React.useEffect(() => {
    void loadRepairs();
  }, [loadRepairs]);

  const loadInventory = React.useCallback(async (value: string) => {
    try {
      setInventoryLoading(true);
      setInventoryError(null);
      const items = await listRepairableInventory({
        search: value || undefined,
        includeReadyForSale: true,
      });
      setInventory(items);
    } catch (requestError) {
      setInventory([]);
      setInventoryError(
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Inventarni yuklab bo'lmadi"
            : "Failed to load inventory",
      );
    } finally {
      setInventoryLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    if (!newOpen) return;
    void loadInventory("");
  }, [newOpen, loadInventory]);

  if (!canView) {
    return <Navigate to="/errors/forbidden" replace />;
  }

  const summary = React.useMemo(() => {
    const totalRepairs = rows.length;
    const totalSpending = rows.reduce((sum, row) => sum + row.totalCost, 0);
    const pendingCount = rows.filter((row) => row.status === "PENDING").length;
    const avgCost = totalRepairs > 0 ? totalSpending / totalRepairs : 0;

    const technicianCounter = new Map<string, number>();
    rows.forEach((row) => {
      const tech = row.technician?.trim();
      if (!tech) return;
      technicianCounter.set(tech, (technicianCounter.get(tech) ?? 0) + 1);
    });
    const topTechnician =
      Array.from(technicianCounter.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";

    return {
      totalRepairs,
      totalSpending,
      pendingCount,
      avgCost,
      topTechnician,
    };
  }, [rows]);

  function guardManageAction(): boolean {
    if (canManage) return false;
    pushToast("error", language === "uz" ? "Ruxsat yo'q" : "Not allowed");
    return true;
  }

  async function openDetails(row: RepairRow): Promise<void> {
    try {
      const detail = await getRepairCase(Number(row.id));
      setSelectedDetail(detail);
      setDetailsOpen(true);
    } catch (requestError) {
      pushToast(
        "error",
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Ta'mir tafsilotlarini yuklab bo'lmadi"
            : "Failed to load repair details",
      );
    }
  }

  async function handleCreate(payload: CreateRepairCasePayload): Promise<void> {
    if (guardManageAction()) return;

    await createRepairCase(payload);
    pushToast("success", language === "uz" ? "Ta'mir ishi yaratildi" : "Repair case created");
    setNewOpen(false);
    await Promise.all([loadRepairs(), loadInventory("")]);
  }

  async function handleUpdateCase(
    repairId: number,
    payload: UpdateRepairCasePayload,
  ): Promise<void> {
    if (guardManageAction()) return;

    const updated = await updateRepairCase(repairId, payload);
    setSelectedDetail(updated);
    pushToast("success", language === "uz" ? "Ta'mir ishi yangilandi" : "Repair case updated");
    await loadRepairs();
  }

  async function handleAddEntry(
    repairId: number,
    payload: AddRepairEntryPayload,
  ): Promise<void> {
    if (guardManageAction()) return;

    const updated = await addRepairEntry(repairId, payload);
    setSelectedDetail(updated);
    pushToast("success", language === "uz" ? "Ta'mir bandi qo'shildi" : "Repair entry added");
    await loadRepairs();
  }

  return (
    <div className="space-y-6">
      <RepairsPageHeader
        canCreate={canManage}
        onNewRepair={() => {
          if (guardManageAction()) return;
          setNewOpen(true);
        }}
      />

      <RepairsSummary
        totalRepairs={summary.totalRepairs}
        totalSpending={summary.totalSpending}
        pendingCount={summary.pendingCount}
        avgCost={summary.avgCost}
        topTechnician={summary.topTechnician}
      />

      <RepairsFilters
        search={search}
        status={status}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        onStatusChange={(value) => {
          setPage(1);
          setStatus(value);
        }}
        onReset={() => {
          setPage(1);
          setSearch("");
          setStatus("all");
        }}
      />

      <RepairsTable
        rows={rows}
        loading={loading}
        error={error}
        canManage={canManage}
        onRowClick={(row) => {
          void openDetails(row);
        }}
        onViewDetails={(row) => {
          void openDetails(row);
        }}
        onEdit={(row) => {
          if (guardManageAction()) return;
          void openDetails(row);
        }}
        onMarkDone={(row) => {
          if (guardManageAction()) return;
          void handleUpdateCase(Number(row.id), { status: "DONE" });
        }}
        onMarkReady={(row) => {
          if (guardManageAction()) return;
          void handleUpdateCase(Number(row.id), {
            notes: row.notes
              ? `${row.notes}\n${language === "uz" ? "Sotuvga tayyor deb belgilandi" : "Marked ready for sale"}`
              : language === "uz"
                ? "Sotuvga tayyor deb belgilandi"
                : "Marked ready for sale",
          });
        }}
      />

      <div className="flex justify-end text-xs text-muted-foreground">
        {language === "uz" ? "Sahifa" : "Page"} {page} / {totalPages} • {rows.length}{" "}
        {language === "uz" ? "ta ko'rsatilgan" : "shown"} • {total}{" "}
        {language === "uz" ? "jami" : "total"}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded-xl border px-3 py-1 text-sm disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          {language === "uz" ? "Oldingi" : "Prev"}
        </button>
        <button
          type="button"
          className="rounded-xl border px-3 py-1 text-sm disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          {language === "uz" ? "Keyingi" : "Next"}
        </button>
      </div>

      <NewRepairModal
        open={newOpen}
        onOpenChange={(nextOpen) => {
          if (!canManage && nextOpen) {
            pushToast("error", language === "uz" ? "Ruxsat yo'q" : "Not allowed");
            return;
          }
          setNewOpen(nextOpen);
        }}
        canManage={canManage}
        availableItems={inventory}
        inventoryLoading={inventoryLoading}
        inventoryError={inventoryError}
        onSearchInventory={(value) => {
          void loadInventory(value);
        }}
        onSubmit={handleCreate}
        currentUserId={Number.isFinite(currentUserId) ? currentUserId : undefined}
      />

      <RepairDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        repair={selectedDetail}
        canManage={canManage}
        onUpdateCase={async (id, payload) => {
          await handleUpdateCase(id, payload);
        }}
        onAddEntry={async (id, payload) => {
          await handleAddEntry(id, payload);
        }}
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
