import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  listAvailableSaleItems,
  type AvailableSaleItem,
  type SaleDetail,
  type SalePaymentMethod,
  type SalePaymentType,
  type UpdateSalePayload,
} from "@/lib/api/sales";
import { useI18n } from "@/lib/i18n/provider";

type CartItem = {
  itemId: number;
  imei: string;
  brand: string;
  model: string;
  salePrice: number;
  notes?: string;
};

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

export function EditSaleModal({
  open,
  onOpenChange,
  canManage,
  sale,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  canManage: boolean;
  sale: SaleDetail | null;
  onSubmit: (id: number, payload: UpdateSalePayload) => Promise<void>;
}) {
  const { language } = useI18n();
  const [inventory, setInventory] = React.useState<AvailableSaleItem[]>([]);
  const [query, setQuery] = React.useState("");
  const [inventoryLoading, setInventoryLoading] = React.useState(false);

  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [customerFullName, setCustomerFullName] = React.useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<SalePaymentMethod>("CASH");
  const [paymentType, setPaymentType] = React.useState<SalePaymentType>("PAID_NOW");
  const [paidNow, setPaidNow] = React.useState(0);
  const [notes, setNotes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const loadInventory = React.useCallback(async () => {
    try {
      setInventoryLoading(true);
      const rows = await listAvailableSaleItems({ q: query.trim() || undefined });
      setInventory(rows);
    } catch {
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, [query]);

  React.useEffect(() => {
    if (!sale || !open) return;
    setCustomerFullName(sale.customer?.fullName ?? "");
    setCustomerPhoneNumber(sale.customer?.phoneNumber ?? "");
    setCustomerAddress(sale.customer?.address ?? "");
    setPaymentMethod(sale.paymentMethod);
    setPaymentType(sale.paymentType);
    setPaidNow(Number(sale.paidNow));
    setNotes(sale.notes ?? "");
    setCart(
      sale.items.map((item) => ({
        itemId: item.itemId,
        imei: item.item.imei,
        brand: item.item.brand,
        model: item.item.model,
        salePrice: Number(item.salePrice),
        notes: item.notes ?? undefined,
      })),
    );
    setErrorMessage(null);
  }, [open, sale]);

  React.useEffect(() => {
    if (!open || !canManage) return;
    void loadInventory();
  }, [open, canManage, loadInventory]);

  const total = cart.reduce((sum, item) => sum + item.salePrice, 0);
  const remaining = total - paidNow;
  const customerRequired = paymentType === "PAY_LATER" || remaining > 0;
  const customerInvalid =
    customerRequired &&
    (!customerFullName.trim() || !customerPhoneNumber.trim());
  const hasInvalidPrice = cart.some((item) => item.salePrice <= 0);

  React.useEffect(() => {
    if (paymentType === "PAID_NOW") {
      setPaidNow(total);
    } else {
      setPaidNow((prev) => Math.min(prev, total));
    }
  }, [paymentType, total]);

  const addToCart = (item: AvailableSaleItem) => {
    if (cart.some((cartItem) => cartItem.itemId === item.id)) return;
    setCart((prev) => [
      ...prev,
      {
        itemId: item.id,
        imei: item.imei,
        brand: item.brand,
        model: item.model,
        salePrice: 0,
      },
    ]);
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const updatePrice = (itemId: number, value: string) => {
    const next = Number(value);
    setCart((prev) =>
      prev.map((item) =>
        item.itemId === itemId
          ? { ...item, salePrice: Number.isFinite(next) ? next : 0 }
          : item,
      ),
    );
  };

  const availableRows = inventory.filter(
    (item) =>
      (item.status === "IN_STOCK" || item.status === "READY_FOR_SALE") &&
      !cart.some((cartItem) => cartItem.itemId === item.id),
  );

  const handleSave = async () => {
    if (!sale) return;
    if (!canManage) {
      setErrorMessage(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
      return;
    }
    if (cart.length === 0) {
      setErrorMessage(
        language === "uz"
          ? "Kamida 1 ta telefon bo'lishi kerak."
          : "At least 1 phone is required.",
      );
      return;
    }
    if (hasInvalidPrice) {
      setErrorMessage(
        language === "uz"
          ? "Har bir sale price 0 dan katta bo'lishi kerak."
          : "Every sale price must be greater than 0.",
      );
      return;
    }
    if (remaining < 0) {
      setErrorMessage(
        language === "uz"
          ? "To'langan summa jamidan katta bo'lmasligi kerak."
          : "Paid amount cannot exceed total.",
      );
      return;
    }
    if (customerInvalid) {
      setErrorMessage(
        language === "uz"
          ? "Pay later yoki remaining bor bo'lsa mijoz to'liq ismi va telefoni majburiy."
          : "Customer full name and phone number are required for pay later or remaining balance.",
      );
      return;
    }

    const payload: UpdateSalePayload = {
      customer:
        customerRequired || customerFullName.trim() || customerPhoneNumber.trim()
          ? {
              fullName: customerFullName.trim(),
              phoneNumber: customerPhoneNumber.trim(),
              address: customerAddress.trim() || undefined,
            }
          : undefined,
      paymentMethod,
      paymentType,
      paidNow,
      notes: notes.trim() || undefined,
      items: cart.map((item) => ({
        itemId: item.itemId,
        salePrice: item.salePrice,
        notes: item.notes,
      })),
    };

    try {
      setSaving(true);
      setErrorMessage(null);
      await onSubmit(sale.id, payload);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : language === "uz"
            ? "Sotuvni yangilab bo'lmadi."
            : "Failed to update sale.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[min(92vw,64rem)] h-[90vh] p-0 overflow-hidden rounded-3xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {language === "uz" ? `Sotuvni tahrirlash #${sale.id}` : `Edit Sale #${sale.id}`}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
            <div className="rounded-3xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">
                  {language === "uz" ? "Mavjud inventar" : "Available inventory"}
                </div>
                <Input
                  className="h-9 rounded-2xl w-[300px]"
                  placeholder={
                    language === "uz"
                      ? "IMEI / brand / model bo'yicha qidiring..."
                      : "Search IMEI / brand / model..."
                  }
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {inventoryLoading ? (
                  <div className="sm:col-span-2 rounded-2xl border p-6 text-center text-sm text-muted-foreground">
                    {language === "uz" ? "Inventar yuklanmoqda..." : "Loading inventory..."}
                  </div>
                ) : null}
                {!inventoryLoading
                  ? availableRows.map((item) => (
                      <div key={item.id} className="rounded-2xl border bg-muted/10 p-4">
                        <p className="text-sm font-semibold">
                          {item.brand} {item.model}
                        </p>
                        <p className="text-xs text-muted-foreground">IMEI: {item.imei}</p>
                        <p className="text-xs text-muted-foreground">
                          Buy: {money(Number(item.purchasePrice))}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          className="mt-3 rounded-2xl"
                          onClick={() => addToCart(item)}
                          disabled={!canManage}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          {language === "uz" ? "Savatchaga qo'shish" : "Add to cart"}
                        </Button>
                      </div>
                    ))
                  : null}
              </div>
            </div>

            <div className="rounded-3xl border p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {language === "uz" ? "Sotuv savatchasi" : "Sale cart"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {cart.length} {language === "uz" ? "ta item" : "item(s)"}
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {cart.map((item) => (
                  <div
                    key={item.itemId}
                    className="rounded-2xl border bg-muted/10 p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {item.brand} {item.model}
                      </p>
                      <p className="text-xs text-muted-foreground">IMEI: {item.imei}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        className={cn(
                          "h-9 rounded-2xl w-[170px]",
                          item.salePrice <= 0 ? "border-amber-400" : "",
                        )}
                        type="number"
                        value={String(item.salePrice)}
                        onChange={(event) => updatePrice(item.itemId, event.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-2xl"
                        onClick={() => removeFromCart(item.itemId)}
                        disabled={!canManage}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border p-4 space-y-4">
              <div className="text-sm font-semibold">
                {language === "uz" ? "To'lov tafsilotlari" : "Payment details"}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Payment method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(value) => setPaymentMethod(value as SalePaymentMethod)}
                  >
                    <SelectTrigger className="h-10 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Payment type</Label>
                  <Select
                    value={paymentType}
                    onValueChange={(value) => setPaymentType(value as SalePaymentType)}
                  >
                    <SelectTrigger className="h-10 rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID_NOW">Paid now</SelectItem>
                      <SelectItem value="PAY_LATER">Pay later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label>Total</Label>
                  <Input className="h-10 rounded-2xl" value={money(total)} readOnly />
                </div>
                <div className="space-y-1">
                  <Label>Paid now</Label>
                  <Input
                    className={cn("h-10 rounded-2xl", remaining < 0 ? "border-rose-400" : "")}
                    type="number"
                    value={String(paidNow)}
                    onChange={(event) => setPaidNow(Number(event.target.value || 0))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Remaining</Label>
                  <Input className="h-10 rounded-2xl" value={money(Math.max(0, remaining))} readOnly />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Customer full name {customerRequired ? "(required)" : "(optional)"}</Label>
                  <Input
                    className={cn(
                      "h-10 rounded-2xl",
                      customerInvalid ? "border-amber-400" : "",
                    )}
                    value={customerFullName}
                    onChange={(event) => setCustomerFullName(event.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Customer phone number {customerRequired ? "(required)" : "(optional)"}</Label>
                  <Input
                    className={cn(
                      "h-10 rounded-2xl",
                      customerInvalid ? "border-amber-400" : "",
                    )}
                    value={customerPhoneNumber}
                    onChange={(event) => setCustomerPhoneNumber(event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-1">
                <div className="space-y-1">
                  <Label>Customer address (optional)</Label>
                  <Input
                    className="h-10 rounded-2xl"
                    value={customerAddress}
                    onChange={(event) => setCustomerAddress(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-amber-300 bg-amber-500/10 p-3 text-sm text-amber-800">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <Separator />
          <div className="p-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
                {language === "uz" ? "Bekor qilish" : "Cancel"}
              </Button>
            <Button onClick={handleSave} disabled={saving || !canManage}>
              <Save className="mr-2 h-4 w-4" />
                {saving
                  ? language === "uz"
                    ? "Saqlanmoqda..."
                    : "Saving..."
                  : language === "uz"
                    ? "O'zgarishlarni saqlash"
                    : "Save changes"}
              </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
