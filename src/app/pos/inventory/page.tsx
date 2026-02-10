import * as React from "react";
import { InventoryFilters, type InventoryFiltersValue } from "./components/inventory-filters";
import { InventoryPageHeader } from "./components/inventory-header";
import { InventorySummary } from "./components/inventory-summary";
import { InventoryTable, type InventoryRow } from "./components/inventory-table";
import { InventoryPagination } from "./components/inventory-pagination";
import { EditInventoryItemModal } from "./modals/edit-inventory-item-modal";
import { NewSaleModal } from "../sales/modals/new-sale-modal";
import { AddPhoneModal } from "./modals/add-phone-modal";
import { EditPurchaseModal } from "../purchases/modals/edit-purchase-modal";
import {
  createInventoryItem,
  deleteInventoryItem,
  listInventoryItems,
  updateInventoryItem,
  type CreateInventoryItemPayload,
  type UpdateInventoryItemPayload,
  type InventoryCondition,
  type InventoryStatus,
} from "@/lib/api/inventory";
import { createSale, type CreateSalePayload } from "@/lib/api/sales";
import { createRepairCase } from "@/lib/api/repairs";
import {
  getPurchase,
  updatePurchase,
  type PurchaseDetail,
  type UpdatePurchasePayload,
} from "@/lib/api/purchases";
import { canManageSales } from "@/lib/auth/permissions";
import { useAppSelector } from "@/store/hooks";
import { useI18n } from "@/lib/i18n/provider";

const PAGE_SIZE = 10;

const INITIAL_FILTERS: InventoryFiltersValue = {
  q: "",
  status: "ALL",
  condition: "ALL",
  brand: "ALL",
};

export default function InventoryPage() {
  const { language } = useI18n();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canManage = canManageSales(role);
  const [filters, setFilters] = React.useState<InventoryFiltersValue>(INITIAL_FILTERS);
  const [page, setPage] = React.useState(1);
  const [rows, setRows] = React.useState<InventoryRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editPurchaseOpen, setEditPurchaseOpen] = React.useState(false);
  const [saleOpen, setSaleOpen] = React.useState(false);
  const [addPhoneOpen, setAddPhoneOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<InventoryRow | null>(null);
  const [selectedPurchase, setSelectedPurchase] = React.useState<PurchaseDetail | null>(null);

  const loadRows = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await listInventoryItems({
        page,
        limit: PAGE_SIZE,
        q: filters.q.trim() || undefined,
        status: filters.status === "ALL" ? undefined : (filters.status as InventoryStatus),
        condition:
          filters.condition === "ALL"
            ? undefined
            : (filters.condition as InventoryCondition),
      });

      const mapped = response.data.map((item) => ({
        id: String(item.id),
        itemName: item.itemName,
        brand: item.brand,
        model: item.model,
        storage: item.storage ?? null,
        imei: item.imei,
        serialNumber: item.serialNumber ?? null,
        purchaseId: item.purchaseId ?? null,
        saleId: item.saleId ?? null,
        condition: item.condition,
        status: item.status,
        cost: Number(item.cost),
        expectedPrice:
          item.expectedSalePrice === null || item.expectedSalePrice === undefined
            ? undefined
            : Number(item.expectedSalePrice),
        profitEst:
          item.expectedSalePrice === null || item.expectedSalePrice === undefined
            ? undefined
            : Number(item.expectedSalePrice) - Number(item.cost),
        purchaseCost: Number(item.purchaseCost),
        repairCost: Number(item.repairCost),
        knownIssues: item.knownIssues ?? null,
      })) satisfies InventoryRow[];

      setRows(mapped);
      setTotal(response.meta.total);
    } catch (requestError) {
      setRows([]);
      setTotal(0);
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Inventar ma'lumotlarini yuklab bo'lmadi."
            : "Failed to load inventory items.",
      );
    } finally {
      setLoading(false);
    }
  }, [filters.condition, filters.q, filters.status, language, page]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const brands = React.useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((row) => {
      const [brand] = row.itemName.split(" ");
      if (brand) unique.add(brand);
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const tableRows = React.useMemo(() => {
    if (filters.brand === "ALL") return rows;
    return rows.filter((row) => row.itemName.toLowerCase().startsWith(filters.brand.toLowerCase()));
  }, [filters.brand, rows]);

  const handleFiltersChange = (next: InventoryFiltersValue) => {
    setPage(1);
    setFilters(next);
  };

  const handleReset = () => {
    setPage(1);
    setFilters(INITIAL_FILTERS);
  };

  async function handleSaveInventoryEdit(
    id: number,
    payload: UpdateInventoryItemPayload,
  ): Promise<void> {
    if (!canManage) throw new Error(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
    await updateInventoryItem(id, payload);
    await loadRows();
  }

  async function handleCreateSale(payload: CreateSalePayload): Promise<void> {
    if (!canManage) throw new Error(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
    await createSale(payload);
    await loadRows();
  }

  async function handleAddPhone(payload: CreateInventoryItemPayload): Promise<void> {
    if (!canManage) throw new Error(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
    await createInventoryItem(payload);
    await loadRows();
  }

  async function handleMoveToRepair(item: InventoryRow): Promise<void> {
    if (!canManage) throw new Error(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
    if (item.status === "IN_REPAIR") return;
    if (item.status === "SOLD") {
      throw new Error(
        language === "uz"
          ? "Sotilgan telefonni ta'mirga o'tkazib bo'lmaydi."
          : "Sold phone cannot be moved to repair.",
      );
    }

    await createRepairCase({
      itemId: Number(item.id),
      description: `Moved to repair from inventory (${item.itemName})`,
      notes:
        language === "uz"
          ? "Inventar harakatidan yaratildi"
          : "Created from inventory action",
    });
    await loadRows();
  }

  async function handleDeleteItem(item: InventoryRow): Promise<void> {
    if (!canManage) throw new Error(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
    await deleteInventoryItem(Number(item.id));
    await loadRows();
  }

  async function handleMarkDone(item: InventoryRow): Promise<void> {
    if (!canManage) throw new Error(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
    if (item.status !== "IN_REPAIR") return;
    await updateInventoryItem(Number(item.id), { status: "READY_FOR_SALE" });
    await loadRows();
  }

  async function handlePurchaseUpdate(
    purchaseId: number,
    payload: UpdatePurchasePayload,
  ): Promise<void> {
    if (!canManage) throw new Error(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
    const updated = await updatePurchase(purchaseId, payload);
    setSelectedPurchase(updated);
    await loadRows();
  }

  return (
    <div className="space-y-6">
      <InventoryPageHeader
        canManage={canManage}
        onAddPhone={() => setAddPhoneOpen(true)}
      />
      <InventoryFilters
        value={filters}
        brands={brands}
        onChange={handleFiltersChange}
        onReset={handleReset}
      />
      <InventorySummary rows={tableRows} />
      <InventoryTable
        rows={tableRows}
        loading={loading}
        error={error}
        canManage={canManage}
        onEditItem={(item) => {
          setSelected(item);
          if (item.purchaseId) {
            void (async () => {
              try {
                const purchase = await getPurchase(item.purchaseId as number);
                setSelectedPurchase(purchase);
                setEditPurchaseOpen(true);
              } catch (requestError) {
                setError(
                  requestError instanceof Error
                    ? requestError.message
                    : language === "uz"
                      ? "Tahrirlash uchun xarid ma'lumotini yuklab bo'lmadi."
                      : "Failed to load purchase for edit.",
                );
              }
            })();
            return;
          }
          setEditOpen(true);
        }}
        onCreateSale={(item) => {
          setSelected(item);
          setSaleOpen(true);
        }}
        onMarkInRepair={handleMoveToRepair}
        onMarkDone={handleMarkDone}
        onDeleteItem={handleDeleteItem}
      />
      <InventoryPagination
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />

      <EditInventoryItemModal
        open={editOpen}
        onOpenChange={setEditOpen}
        item={selected}
        canEdit={canManage}
        onSave={handleSaveInventoryEdit}
      />

      <EditPurchaseModal
        open={editPurchaseOpen}
        purchase={selectedPurchase}
        canManage={canManage}
        onClose={() => setEditPurchaseOpen(false)}
        onSubmit={handlePurchaseUpdate}
      />

      <NewSaleModal
        open={saleOpen}
        onOpenChange={setSaleOpen}
        canManage={canManage}
        onSubmit={handleCreateSale}
        preselectedItemId={selected ? Number(selected.id) : null}
      />

      <AddPhoneModal
        open={addPhoneOpen}
        onOpenChange={setAddPhoneOpen}
        canManage={canManage}
        onCreate={handleAddPhone}
      />
    </div>
  );
}
