import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SaleDetail } from "@/lib/api/sales";
import { useI18n } from "@/lib/i18n/provider";

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

export function AddPaymentModal({
  open,
  onOpenChange,
  sale,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  sale: SaleDetail | null;
  onSubmit: (saleId: number, amount: number) => Promise<void>;
}) {
  const { language } = useI18n();
  const remaining = Number(sale?.remaining ?? 0);
  const [amount, setAmount] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setAmount(remaining > 0 ? String(remaining) : "");
    setError(null);
  }, [open, remaining]);

  const numericAmount = Number(amount || 0);

  async function handleSubmit(): Promise<void> {
    if (!sale) return;

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(
        language === "uz"
          ? "To'lov summasi 0 dan katta bo'lishi kerak."
          : "Payment amount must be greater than 0.",
      );
      return;
    }

    if (numericAmount > remaining) {
      setError(
        language === "uz"
          ? "To'lov summasi remaining'dan katta bo'lishi mumkin emas."
          : "Payment amount cannot be greater than remaining.",
      );
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSubmit(sale.id, numericAmount);
      onOpenChange(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : language === "uz"
            ? "To'lov qo'shib bo'lmadi."
            : "Failed to add payment.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!sale) return null;
  const firstItem = sale.items?.[0]?.item;
  const phoneTitle = firstItem
    ? `${firstItem.brand} ${firstItem.model}`
    : `Sale #${sale.id}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle>
            {language === "uz"
              ? `${phoneTitle} uchun to'lov qo'shish`
              : `Add payment for ${phoneTitle}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-muted/10 p-3 text-sm">
            {language === "uz" ? "Qolgan summa" : "Remaining"}:{" "}
            <span className="font-semibold">{money(remaining)}</span>
          </div>

          <div className="space-y-1">
            <Label>{language === "uz" ? "To'lov summasi" : "Payment amount"}</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-10 rounded-2xl"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              {language === "uz" ? "Bekor qilish" : "Cancel"}
            </Button>
            <Button className="rounded-2xl" onClick={() => void handleSubmit()} disabled={saving}>
              {saving
                ? language === "uz"
                  ? "Saqlanmoqda..."
                  : "Saving..."
                : language === "uz"
                  ? "To'lovni saqlash"
                  : "Save payment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
