import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy, Pencil, ShoppingCart } from "lucide-react";
import type { InventoryRow } from "../components/inventory-table";
import { useI18n } from "@/lib/i18n/provider";
import {
  getInventoryItem,
  type InventoryActivity,
  type InventoryDetailItem,
} from "@/lib/api/inventory";

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

export function InventoryDetailsModal({
  open,
  onOpenChange,
  item,
  canManage,
  onEdit,
  onCreateSale,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: InventoryRow | null;
  canManage: boolean;
  onEdit: (item: InventoryRow) => void;
  onCreateSale: (item: InventoryRow) => void;
}) {
  const { language } = useI18n();
  const [activities, setActivities] = React.useState<InventoryActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = React.useState(false);
  const [activitiesError, setActivitiesError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || !item?.id) return;

    let active = true;
    const loadDetail = async () => {
      try {
        setActivitiesLoading(true);
        setActivitiesError(null);
        const detail: InventoryDetailItem = await getInventoryItem(Number(item.id));
        if (!active) return;
        setActivities(detail.activities ?? []);
      } catch (error) {
        if (!active) return;
        setActivities([]);
        setActivitiesError(
          error instanceof Error
            ? error.message
            : language === "uz"
              ? "Aktivliklarni yuklab bo'lmadi."
              : "Failed to load activities.",
        );
      } finally {
        if (active) {
          setActivitiesLoading(false);
        }
      }
    };

    void loadDetail();
    return () => {
      active = false;
    };
  }, [open, item?.id, language]);

  const statusToLabel = (status?: string | null) => {
    if (!status) return "—";
    if (status === "IN_STOCK") return language === "uz" ? "Omborda" : "In Stock";
    if (status === "IN_REPAIR") return language === "uz" ? "Ta'mirda" : "In Repair";
    if (status === "READY_FOR_SALE")
      return language === "uz" ? "Sotuvga tayyor" : "Ready for Sale";
    if (status === "SOLD") return language === "uz" ? "Sotilgan" : "Sold";
    if (status === "RETURNED") return language === "uz" ? "Qaytarilgan" : "Returned";
    return status;
  };

  const activityTypeLabel = (type: string) => {
    if (type === "CREATED") {
      return language === "uz" ? "Inventoryga qo'shildi" : "Added to inventory";
    }
    if (type === "PURCHASED") {
      return language === "uz" ? "Telefon sotib olindi" : "Phone purchased";
    }
    if (type === "SOLD") {
      return language === "uz" ? "Telefon sotildi" : "Phone sold";
    }
    if (type === "MOVED_TO_REPAIR") {
      return language === "uz" ? "Ta'mirga o'tkazildi" : "Moved to repair";
    }
    if (type === "MARKED_DONE") {
      return language === "uz" ? "Bajarildi deb belgilandi" : "Marked done";
    }
    return language === "uz" ? "Holat o'zgardi" : "Status changed";
  };

  const formatWhen = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };
  const copyIMEI = async () => {
    if (!item?.imei) return;
    try {
      await navigator.clipboard.writeText(item.imei);
    } catch {}
  };

  const purchasePrice = Number(item?.purchaseCost ?? 0);
  const repairPrice = Number(item?.repairCost ?? 0);
  const totalCost = Number(item?.cost ?? 0);
  const expectedPrice = Number(item?.expectedPrice ?? 0);
  const profitEst =
    item?.expectedPrice !== undefined ? expectedPrice - totalCost : undefined;
  const conditionLabel =
    item?.condition === "GOOD"
      ? language === "uz"
        ? "Yaxshi"
        : "Good"
      : item?.condition === "USED"
        ? language === "uz"
          ? "Ishlatilgan"
          : "Used"
        : item?.condition === "BROKEN"
          ? language === "uz"
            ? "Nosoz"
            : "Broken"
          : item?.condition ?? "—";
  const statusLabel =
    item?.status === "IN_STOCK"
      ? language === "uz"
        ? "Omborda"
        : "In Stock"
      : item?.status === "IN_REPAIR"
        ? language === "uz"
          ? "Ta'mirda"
          : "In Repair"
        : item?.status === "READY_FOR_SALE"
          ? language === "uz"
            ? "Sotuvga tayyor"
            : "Ready for Sale"
          : item?.status === "SOLD"
            ? language === "uz"
              ? "Sotilgan"
              : "Sold"
            : item?.status === "RETURNED"
              ? language === "uz"
                ? "Qaytarilgan"
                : "Returned"
              : item?.status ?? "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>{language === "uz" ? "Telefon tafsilotlari" : "Phone details"}</DialogTitle>
        </DialogHeader>

        {!item ? (
          <div className="text-sm text-muted-foreground">
            {language === "uz" ? "Telefon tanlanmagan" : "No item selected"}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-lg font-semibold">{item.itemName}</div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border bg-muted/10 p-4">
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">IMEI / Serial</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground break-all">
                    {item.imei ?? "—"}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-2xl"
                  onClick={copyIMEI}
                  disabled={!item.imei}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {language === "uz" ? "Nusxalash" : "Copy"}
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-muted/10 p-4">
                  <div className="text-xs text-muted-foreground">
                    {language === "uz" ? "Holati" : "Condition"}
                  </div>
                  <div className="mt-1 text-sm font-medium">{conditionLabel}</div>
                </div>
                <div className="rounded-2xl border bg-muted/10 p-4">
                  <div className="text-xs text-muted-foreground">
                    {language === "uz" ? "Holat" : "Status"}
                  </div>
                  <div className="mt-1 text-sm font-medium">{statusLabel}</div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="text-sm font-semibold">
                {language === "uz" ? "Narx tarkibi" : "Cost breakdown"}
              </div>

              <div className="rounded-2xl border bg-muted/10 p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {language === "uz" ? "Xarid narxi" : "Purchase price"}
                  </span>
                  <span className="font-medium">{money(purchasePrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {language === "uz" ? "Ta'mir narxi" : "Repair price"}
                  </span>
                  <span className="font-medium">{money(repairPrice)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {language === "uz" ? "Umumiy tannarx" : "Total cost"}
                  </span>
                  <span className="font-semibold">{money(totalCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {language === "uz" ? "Kutilgan sotuv narxi" : "Expected sale price"}
                  </span>
                  <span className="font-semibold">
                    {item.expectedPrice !== undefined ? money(item.expectedPrice) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {language === "uz" ? "Foyda (taxm.)" : "Profit (est.)"}
                  </span>
                  <span className="font-semibold">
                    {profitEst !== undefined ? money(profitEst) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="text-sm font-semibold">
                {language === "uz" ? "Tezkor amallar" : "Quick actions"}
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  className="rounded-2xl"
                  variant="outline"
                  type="button"
                  disabled={!canManage}
                  onClick={() => {
                    onOpenChange(false);
                    onEdit(item);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {language === "uz" ? "Tahrirlash" : "Edit"}
                </Button>
                <Button
                  className="rounded-2xl"
                  type="button"
                  disabled={!canManage}
                  onClick={() => {
                    onOpenChange(false);
                    onCreateSale(item);
                  }}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {language === "uz" ? "Sotuv yaratish" : "Create sale"}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="text-sm font-semibold">
                {language === "uz" ? "Aktivliklar" : "Activities"}
              </div>

              {activitiesLoading ? (
                <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                  {language === "uz" ? "Aktivliklar yuklanmoqda..." : "Loading activities..."}
                </div>
              ) : null}

              {!activitiesLoading && activitiesError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                  {activitiesError}
                </div>
              ) : null}

              {!activitiesLoading && !activitiesError && activities.length === 0 ? (
                <div className="rounded-2xl border bg-muted/10 p-4 text-sm text-muted-foreground">
                  {language === "uz" ? "Aktivliklar hali yo'q." : "No activities yet."}
                </div>
              ) : null}

              {!activitiesLoading && !activitiesError && activities.length > 0 ? (
                <div className="space-y-2">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-2xl border bg-muted/10 p-3 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="font-medium">{activityTypeLabel(activity.type)}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatWhen(activity.happenedAt)}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {statusToLabel(activity.fromStatus)} {" -> "}{" "}
                        <span className="font-medium text-foreground">
                          {statusToLabel(activity.toStatus)}
                        </span>
                      </div>
                      {activity.notes ? (
                        <div className="mt-1 break-words text-xs text-muted-foreground">
                          {activity.notes}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
