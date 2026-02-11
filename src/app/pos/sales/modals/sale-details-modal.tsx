import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HandCoins, Pencil, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaleDetail } from "@/lib/api/sales";
import { useI18n } from "@/lib/i18n/provider";

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

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

function statusPill(status: "PAID" | "PARTIAL" | "UNPAID") {
  if (status === "PAID") return "bg-emerald-500/15 text-emerald-700";
  if (status === "PARTIAL") return "bg-amber-500/15 text-amber-700";
  return "bg-rose-500/15 text-rose-700";
}

function computeStatus(
  total: number,
  remaining: number,
): "PAID" | "PARTIAL" | "UNPAID" {
  if (remaining <= 0) return "PAID";
  if (remaining >= total) return "UNPAID";
  return "PARTIAL";
}

export function SaleDetailsModal({
  open,
  onOpenChange,
  sale,
  canManage,
  onEdit,
  onAddPayment,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sale: SaleDetail | null;
  canManage: boolean;
  onEdit: (sale: SaleDetail) => void;
  onAddPayment: (sale: SaleDetail) => void;
}) {
  const { language } = useI18n();
  if (!sale) return null;
  const total = Number(sale.totalPrice);
  const paidNow = Number(sale.paidNow);
  const remaining = Number(sale.remaining);
  const status = computeStatus(total, remaining);

  const paymentMethodLabel =
    sale.paymentMethod === "CASH"
      ? language === "uz"
        ? "Naqd"
        : "Cash"
      : sale.paymentMethod === "CARD"
        ? language === "uz"
          ? "Karta"
          : "Card"
        : language === "uz"
          ? "Boshqa"
          : "Other";

  function downloadReceiptPdf(): void {
    const currentSale = sale;
    if (!currentSale) return;

    const receiptWindow = window.open("", "_blank", "width=720,height=900");
    if (!receiptWindow) return;

    const rows = currentSale.items
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
          <title>Sale Receipt #${currentSale.id}</title>
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
          <h1>${language === "uz" ? "Sotuv cheki" : "Sale Receipt"} #${currentSale.id}</h1>
          <div class="meta">
            <p>${language === "uz" ? "Sana" : "Date"}: ${formatDateTime(currentSale.soldAt)}</p>
            <p>${language === "uz" ? "Mijoz" : "Customer"}: ${currentSale.customer?.fullName ?? "-"}</p>
            <p>${language === "uz" ? "Telefon" : "Phone"}: ${currentSale.customer?.phoneNumber ?? "-"}</p>
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
            <tbody>${rows}</tbody>
          </table>
          <div class="totals">
            <p><strong>${language === "uz" ? "Jami" : "Total"}:</strong> ${money(total)}</p>
            <p><strong>${language === "uz" ? "Hozir to'langan" : "Paid now"}:</strong> ${money(paidNow)}</p>
            <p><strong>${language === "uz" ? "Qolgan" : "Remaining"}:</strong> ${money(remaining)}</p>
          </div>
          <script>
            window.onload = function () { window.print(); }
          </script>
        </body>
      </html>
    `);
    receiptWindow.document.close();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] p-0 overflow-hidden rounded-3xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {language === "uz" ? "Sotuv tafsilotlari" : "Sale details"}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDateTime(sale.soldAt)}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {sale.paymentType === "PAID_NOW"
                  ? language === "uz"
                    ? "Hozir to'langan"
                    : "Paid now"
                  : language === "uz"
                    ? "Keyin to'lash"
                    : "Pay later"}
              </Badge>
              <Badge className={cn("rounded-full", statusPill(status))}>
                {status === "PAID"
                  ? language === "uz"
                    ? "To'langan"
                    : "Paid"
                  : status === "PARTIAL"
                    ? language === "uz"
                      ? "Qisman"
                      : "Partial"
                    : language === "uz"
                      ? "To'lanmagan"
                      : "Unpaid"}
              </Badge>
              <Badge variant="outline" className="rounded-full">
                {language === "uz" ? "Usul" : "Method"}: {paymentMethodLabel}
              </Badge>
            </div>

            <div className="rounded-3xl border bg-muted/10 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="text-xs text-muted-foreground">
                    {language === "uz" ? "Jami" : "Total"}
                  </div>
                  <div className="text-sm font-semibold">{money(total)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {language === "uz" ? "Hozir to'langan" : "Paid now"}
                  </div>
                  <div className="text-sm font-semibold">{money(paidNow)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {language === "uz" ? "Qolgan (Qarz)" : "Remaining (Debt)"}
                  </div>
                  <div className="text-sm font-semibold">
                    {money(remaining)}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border p-4">
                <div className="text-sm font-semibold">
                  {language === "uz" ? "Mijoz" : "Customer"}
                </div>
                <div className="mt-2 text-sm">
                  {sale.customer?.fullName || ""}
                </div>
                <div className="text-sm text-muted-foreground">
                  {sale.customer?.phoneNumber || "—"}
                </div>
              </div>

              <div className="rounded-3xl border p-4">
                <div className="text-sm font-semibold">
                  {language === "uz" ? "Izohlar" : "Notes"}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {sale.notes || "—"}
                </div>
              </div>
            </div>

            <Separator />

            <div className="rounded-3xl border p-4">
              <div className="text-sm font-semibold">
                {language === "uz" ? "Telefonlar" : "Items"}
              </div>
              <div className="mt-2 space-y-2">
                {sale.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border bg-muted/10 p-3"
                  >
                    <p className="text-sm font-medium">
                      {item.item.brand} {item.item.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      IMEI: {item.item.imei} • {item.item.condition} •{" "}
                      {item.item.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "uz" ? "Sotuv narxi" : "Sale price"}:{" "}
                      {money(Number(item.salePrice))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border p-4">
              <div className="text-sm font-semibold">
                {language === "uz"
                  ? "To'lov faoliyatlari"
                  : "Payment activities"}
              </div>
              <div className="mt-2 space-y-2">
                {(sale.activities ?? []).length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    {language === "uz"
                      ? "Hali to'lov faoliyati yo'q."
                      : "No payment activity yet."}
                  </div>
                ) : (
                  sale.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-xl border bg-muted/10 p-3"
                    >
                      <p className="text-sm font-medium">
                        {money(Number(activity.amount))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateOnly(activity.paidAt)}
                      </p>
                      {activity.notes ? (
                        <p className="text-xs text-muted-foreground">
                          {activity.notes}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={downloadReceiptPdf}
              >
                <Printer className="mr-2 h-4 w-4" />
                {language === "uz" ? "Chek (PDF)" : "Receipt (PDF)"}
              </Button>
              {canManage && remaining > 0 ? (
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={() => onAddPayment(sale)}
                >
                  <HandCoins className="mr-2 h-4 w-4" />
                  {language === "uz" ? "To'lov qo'shish" : "Add payment"}
                </Button>
              ) : null}
              {canManage ? (
                <Button className="rounded-2xl" onClick={() => onEdit(sale)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {language === "uz" ? "Tahrirlash" : "Edit"}
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
