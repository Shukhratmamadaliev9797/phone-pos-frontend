import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { InventoryDetailsModal } from "../modals/inventory-details-modal";
import { useI18n } from "@/lib/i18n/provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


export type InventoryStatus =
  | "IN_STOCK"
  | "IN_REPAIR"
  | "READY_FOR_SALE"
  | "SOLD"
  | "RETURNED";
export type InventoryCondition = "GOOD" | "USED" | "BROKEN";

export type InventoryRow = {
  id: string;
  itemName: string; // iPhone 12 128GB
  brand?: string;
  model?: string;
  storage?: string | null;
  imei?: string;
  condition: InventoryCondition;
  status: InventoryStatus;
  cost: number; // total cost
  expectedPrice?: number;
  profitEst?: number;
  purchaseCost?: number;
  repairCost?: number;
  serialNumber?: string | null;
  purchaseId?: number | null;
  saleId?: number | null;
  knownIssues?: string | null;
};

function money(n: number) {
  return `${n.toLocaleString("en-US")} so'm`;
}

function StatusBadge({ status }: { status: InventoryStatus }) {
  const { language } = useI18n();
  const cls =
    status === "READY_FOR_SALE"
      ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
      : status === "IN_REPAIR"
      ? "bg-amber-500/10 text-amber-800 border-amber-200"
      : status === "IN_STOCK"
      ? "bg-sky-500/10 text-sky-700 border-sky-200"
      : status === "SOLD"
      ? "bg-zinc-500/10 text-zinc-700 border-zinc-200"
      : "bg-rose-500/10 text-rose-700 border-rose-200";

  const label =
    status === "IN_STOCK"
      ? language === "uz"
        ? "Sotuvga tayyor"
        : "Ready for sale"
      : status === "IN_REPAIR"
      ? language === "uz"
        ? "Ta'mirda"
        : "In Repair"
      : status === "READY_FOR_SALE"
      ? language === "uz"
        ? "Sotuvga tayyor"
        : "Ready for sale"
      : status === "SOLD"
      ? language === "uz"
        ? "Sotilgan"
        : "Sold"
      : language === "uz"
        ? "Qaytarilgan"
        : "Returned";

  return (
    <Badge
      variant="secondary"
      className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", cls)}
    >
      {label}
    </Badge>
  );
}

function ConditionText({ condition }: { condition: InventoryCondition }) {
  const { language } = useI18n();
  const label =
    condition === "GOOD"
      ? language === "uz"
        ? "Yaxshi"
        : "Good"
      : condition === "USED"
        ? language === "uz"
          ? "Ishlatilgan"
          : "Used"
        : language === "uz"
          ? "Nosoz"
          : "Broken";
  return <span className="text-sm">{label}</span>;
}

export function InventoryTable({
  rows,
  loading,
  error,
  canManage,
  onEditItem,
  onCreateSale,
  onMarkInRepair,
  onMarkDone,
  onDeleteItem,
}: {
  rows: InventoryRow[];
  loading: boolean;
  error: string | null;
  canManage: boolean;
  onEditItem: (item: InventoryRow) => void;
  onCreateSale: (item: InventoryRow) => void;
  onMarkInRepair: (item: InventoryRow) => Promise<void>;
  onMarkDone: (item: InventoryRow) => Promise<void>;
  onDeleteItem: (item: InventoryRow) => Promise<void>;
}) {
  const { language } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<InventoryRow | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<InventoryRow | null>(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const openDetails = (row: InventoryRow) => {
    setSelected(row);
    setOpen(true);
  };

  const onAction = (action: string, row: InventoryRow) => {
    if (action === "view") openDetails(row);
    if (action === "sale") onCreateSale(row);
    if (action === "repair") {
      void (async () => {
        try {
          setActionError(null);
          await onMarkInRepair(row);
        } catch (requestError) {
          setActionError(
            requestError instanceof Error
              ? requestError.message
              : language === "uz"
                ? "Telefonni ta'mirga o'tkazib bo'lmadi."
                : "Failed to move phone to repair.",
          );
        }
      })();
    }
    if (action === "done") {
      void (async () => {
        try {
          setActionError(null);
          await onMarkDone(row);
        } catch (requestError) {
          setActionError(
            requestError instanceof Error
              ? requestError.message
              : language === "uz"
                ? "Holatni yangilab bo'lmadi."
                : "Failed to update status.",
          );
        }
      })();
    }
    if (action === "delete") {
      setDeleteTarget(row);
      setDeleteConfirmOpen(true);
    }
  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      setActionError(null);
      await onDeleteItem(deleteTarget);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
    } catch (requestError) {
      setActionError(
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Telefonni o'chirib bo'lmadi."
            : "Failed to delete phone.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <>
      <div className="rounded-3xl border border-muted/40 bg-muted/30 p-3">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">{language === "uz" ? "Nomi" : "Item"}</TableHead>
                <TableHead className="min-w-[160px]">{language === "uz" ? "Xotira" : "Storage"}</TableHead>
                <TableHead>{language === "uz" ? "Holati" : "Condition"}</TableHead>
              <TableHead>{language === "uz" ? "Holat" : "Status"}</TableHead>
              <TableHead>{language === "uz" ? "Turi" : "Type"}</TableHead>
              <TableHead className="text-right">{language === "uz" ? "Narx" : "Price"}</TableHead>
              <TableHead className="w-[60px] text-right"> </TableHead>
            </TableRow>
          </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {language === "uz" ? "Inventar yuklanmoqda..." : "Loading inventory..."}
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && error ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-rose-600">
                    {error}
                  </TableCell>
                </TableRow>
              ) : null}

              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => openDetails(row)}
                >
                  <TableCell className="font-medium">{row.itemName}</TableCell>

                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {row.storage?.trim() || "—"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <ConditionText condition={row.condition} />
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={row.status} />
                  </TableCell>

                  <TableCell>
                    <span className="text-sm">
                      {row.purchaseId
                        ? language === "uz"
                          ? "Sotib olingan telefon"
                          : "Purchased phone"
                        : language === "uz"
                          ? "Admin tomonidan qo'shilgan"
                          : "Added by admin"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">{money(row.purchaseCost ?? 0)}</TableCell>

                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-xl"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => onAction("view", row)}>
                          {language === "uz" ? "Batafsil ko'rish" : "View details"}
                        </DropdownMenuItem>
                        {canManage ? (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                onAction(row.status === "IN_REPAIR" ? "done" : "repair", row)
                              }
                            >
                              {row.status === "IN_REPAIR"
                                ? language === "uz"
                                  ? "Sotuvga tayyor"
                                  : "Ready for sale"
                                : language === "uz"
                                  ? "Ta'mirga o'tkazish"
                                  : "In repair"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAction("sale", row)}>
                              {language === "uz" ? "Sotuv yaratish" : "Create sale"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-rose-600 focus:text-rose-600"
                              onClick={() => onAction("delete", row)}
                            >
                              {language === "uz" ? "O'chirish" : "Delete"}
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {!loading && !error && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                    {language === "uz"
                      ? "Inventarda telefonlar topilmadi."
                      : "No inventory phones found."}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      {actionError ? (
        <p className="mt-2 text-sm text-rose-600">{actionError}</p>
      ) : null}

      <InventoryDetailsModal
        open={open}
        onOpenChange={setOpen}
        item={selected}
        canManage={canManage}
        onEdit={onEditItem}
        onCreateSale={onCreateSale}
      />

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>{language === "uz" ? "Telefonni o'chirish" : "Delete phone"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteTarget
              ? language === "uz"
                ? `"${deleteTarget.itemName}" telefonini o'chirmoqchimisiz? Bu amal uni inventardan yashiradi.`
                : `Are you sure you want to delete "${deleteTarget.itemName}"? This action will hide it from inventory.`
              : language === "uz"
                ? "Rostdan ham bu telefonni o'chirmoqchimisiz?"
                : "Are you sure you want to delete this phone?"}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDeleteTarget(null);
              }}
            >
              {language === "uz" ? "Bekor qilish" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleteLoading}
            >
              {deleteLoading
                ? language === "uz"
                  ? "O'chirilmoqda..."
                  : "Deleting..."
                : language === "uz"
                  ? "O'chirish"
                  : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
