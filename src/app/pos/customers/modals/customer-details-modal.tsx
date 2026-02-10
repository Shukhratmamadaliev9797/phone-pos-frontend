import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import type { CustomerBalanceRow, CustomerDetail } from "@/lib/api/customers";
import { useI18n } from "@/lib/i18n/provider";

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

export function CustomerDetailsModal({
  open,
  onOpenChange,
  row,
  customer,
  canManage,
  onAddSalePayment,
  onAddPurchasePayment,
  onEditSale,
  onEditPurchase,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  row: CustomerBalanceRow | null;
  customer: CustomerDetail | null;
  canManage: boolean;
  onAddSalePayment?: (saleId: number) => void;
  onAddPurchasePayment?: (purchaseId: number) => void;
  onEditSale?: (saleId: number) => void;
  onEditPurchase?: (purchaseId: number) => void;
}) {
  const { language } = useI18n();
  if (!row) return null;

  const details = customer?.customer ?? row.customer;
  const debt = customer?.debt ?? row.debt;
  const credit = customer?.credit ?? row.credit;
  const totalDue = customer?.totalDue ?? row.totalDue ?? debt + credit;
  const soldPhones = customer?.soldPhones ?? row.soldPhones;
  const purchasedPhones = customer?.purchasedPhones ?? row.purchasedPhones;
  const activities = customer?.activities ?? [];
  const targetSaleId = customer?.openSales?.[0]?.id;
  const targetPurchaseId = customer?.openPurchases?.[0]?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[min(94vw,56rem)] rounded-3xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">
                {language === "uz" ? "Mijoz ma'lumotlari" : "Customer details"}
              </DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {details.fullName} • {details.phoneNumber}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {debt > 0 ? (
              <Badge className="rounded-full bg-rose-500/15 text-rose-700 hover:bg-rose-500/15">
                {language === "uz" ? "Dokon Qarz" : "Shop Debt"}: {money(debt)}
              </Badge>
            ) : (
              <Badge className="rounded-full bg-amber-500/15 text-amber-700 hover:bg-amber-500/15">
                {language === "uz" ? "Mijoz Qarz" : "Customer Debt"}:{" "}
                {money(credit)}
              </Badge>
            )}
            <Badge className="rounded-full bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15">
              {language === "uz" ? "Jami to'lov" : "Total due"}:{" "}
              {money(totalDue)}
            </Badge>
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-muted/10 p-4">
              <div className="text-xs text-muted-foreground">
                {language === "uz" ? "To'liq ism" : "Full name"}
              </div>
              <div className="text-sm font-medium">
                {details.fullName || "—"}
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/10 p-4">
              <div className="text-xs text-muted-foreground">
                {language === "uz" ? "Telefon" : "Phone"}
              </div>
              <div className="text-sm font-medium">
                {details.phoneNumber || "—"}
              </div>
            </div>

            <div className="rounded-2xl border bg-muted/10 p-4 sm:col-span-2">
              <div className="text-xs text-muted-foreground">
                {language === "uz" ? "Manzil" : "Address"}
              </div>
              <div className="text-sm font-medium break-words whitespace-normal">
                {details.address || "—"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="text-xs text-muted-foreground">
              {language === "uz" ? "Izohlar" : "Notes"}
            </div>
            <div className="text-sm font-medium">{details.notes || "—"}</div>
          </div>

          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="text-xs text-muted-foreground">
              {language === "uz" ? "Telefon tafsilotlari" : "Phone details"}
            </div>
            <div className="mt-2 text-sm">
              <div>
                <span className="font-medium">
                  {language === "uz" ? "Sotilgan:" : "Sold:"}
                </span>{" "}
                {soldPhones || "—"}
              </div>
              <div>
                <span className="font-medium">
                  {language === "uz" ? "Sotib olingan:" : "Bought:"}
                </span>{" "}
                {purchasedPhones || "—"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-muted/10 p-4">
            <div className="text-xs text-muted-foreground">
              {language === "uz" ? "Faoliyatlar" : "Activities"}
            </div>
            <div className="mt-2 space-y-2">
              {activities.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  {language === "uz" ? "Faoliyatlar yo'q" : "No activities"}
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div
                    key={`${activity.type}-${activity.paidAt}-${index}`}
                    className="rounded-xl border bg-background p-3 text-sm"
                  >
                    <div className="font-medium">
                      {activity.type === "SALE_PAYMENT"
                        ? language === "uz"
                          ? "Sotuv to'lovi"
                          : "Sale payment"
                        : language === "uz"
                          ? "Xarid to'lovi"
                          : "Purchase payment"}
                      : {money(activity.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(activity.paidAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.notes || "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end">
            {canManage && targetSaleId ? (
              <Button
                variant="secondary"
                className="rounded-2xl mr-2"
                onClick={() => onAddSalePayment?.(targetSaleId)}
              >
                {language === "uz"
                  ? "To'lov qo'shish (Sotuv)"
                  : "Add payment (Sale)"}
              </Button>
            ) : null}
            {canManage && targetPurchaseId ? (
              <Button
                variant="secondary"
                className="rounded-2xl mr-2"
                onClick={() => onAddPurchasePayment?.(targetPurchaseId)}
              >
                {language === "uz"
                  ? "To'lov qo'shish (Xarid)"
                  : "Add payment (Purchase)"}
              </Button>
            ) : null}
            {canManage && targetSaleId ? (
              <Button
                variant="outline"
                className="rounded-2xl mr-2"
                onClick={() => onEditSale?.(targetSaleId)}
              >
                {language === "uz" ? "Sotuvni tahrirlash" : "Edit Sale"}
              </Button>
            ) : null}
            {canManage && targetPurchaseId ? (
              <Button
                variant="outline"
                className="rounded-2xl mr-2"
                onClick={() => onEditPurchase?.(targetPurchaseId)}
              >
                {language === "uz" ? "Xaridni tahrirlash" : "Edit Purchase"}
              </Button>
            ) : null}
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => onOpenChange(false)}
            >
              {language === "uz" ? "Yopish" : "Close"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
