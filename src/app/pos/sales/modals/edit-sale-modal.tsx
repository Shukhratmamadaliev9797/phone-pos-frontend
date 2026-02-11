import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Save, Trash2, ChevronsUpDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [inventoryLoading, setInventoryLoading] = React.useState(false);
  const [inventoryError, setInventoryError] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [itemsOpen, setItemsOpen] = React.useState(false);

  const [paymentMethod, setPaymentMethod] = React.useState<SalePaymentMethod>("CASH");
  const [paymentType, setPaymentType] = React.useState<SalePaymentType>("PAID_NOW");
  const [initialPayInput, setInitialPayInput] = React.useState("");
  const [initialPayError, setInitialPayError] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState("");
  const [customerFullName, setCustomerFullName] = React.useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");
  const [customerFieldInvalid, setCustomerFieldInvalid] = React.useState({
    fullName: false,
    phoneNumber: false,
    address: false,
  });
  const [saving, setSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [cart, setCart] = React.useState<CartItem[]>([]);

  const loadInventory = React.useCallback(async () => {
    try {
      setInventoryLoading(true);
      setInventoryError(null);
      const rows = await listAvailableSaleItems({ q: query.trim() || undefined });
      setInventory(rows);
    } catch (error) {
      setInventoryError(
        error instanceof Error
          ? error.message
          : language === "uz"
            ? "Inventar ma'lumotlarini yuklab bo'lmadi."
            : "Failed to load inventory items.",
      );
      setInventory([]);
    } finally {
      setInventoryLoading(false);
    }
  }, [language, query]);

  React.useEffect(() => {
    if (!open || !canManage) return;
    void loadInventory();
  }, [open, canManage, loadInventory]);

  React.useEffect(() => {
    if (!open || !sale) return;

    const currentPaidNow = Number(sale.paidNow ?? 0);
    setPaymentMethod(sale.paymentMethod);
    setPaymentType(sale.paymentType);
    setInitialPayInput(sale.paymentType === "PAY_LATER" ? String(currentPaidNow) : "");
    setInitialPayError(null);
    setNotes(sale.notes ?? "");
    setCustomerFullName(sale.customer?.fullName ?? "");
    setCustomerPhoneNumber(sale.customer?.phoneNumber ?? "");
    setCustomerAddress(sale.customer?.address ?? "");
    setCustomerFieldInvalid({
      fullName: false,
      phoneNumber: false,
      address: false,
    });
    setErrorMessage(null);
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
  }, [open, sale]);

  React.useEffect(() => {
    if (!open) {
      setInventory([]);
      setInventoryLoading(false);
      setInventoryError(null);
      setQuery("");
      setItemsOpen(false);
      setPaymentMethod("CASH");
      setPaymentType("PAID_NOW");
      setInitialPayInput("");
      setInitialPayError(null);
      setNotes("");
      setCustomerFullName("");
      setCustomerPhoneNumber("");
      setCustomerAddress("");
      setCustomerFieldInvalid({
        fullName: false,
        phoneNumber: false,
        address: false,
      });
      setSaving(false);
      setErrorMessage(null);
      setCart([]);
    }
  }, [open]);

  const total = cart.reduce((sum, item) => sum + (Number(item.salePrice) || 0), 0);
  const effectivePaidNow = paymentType === "PAID_NOW" ? total : Number(initialPayInput || 0);
  const remaining = total - effectivePaidNow;

  const noItems = cart.length === 0;
  const hasInvalidPrice = cart.some((item) => !Number.isFinite(item.salePrice) || item.salePrice <= 0);
  const requiresCustomer = paymentType === "PAY_LATER" || remaining > 0;

  const saveDisabled = !canManage || saving || noItems || hasInvalidPrice;

  const addToCart = (item: AvailableSaleItem) => {
    if (cart.some((cartItem) => cartItem.itemId === item.id)) {
      return;
    }
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
        item.itemId === itemId ? { ...item, salePrice: Number.isFinite(next) ? next : 0 } : item,
      ),
    );
  };

  const handleSave = async () => {
    if (!sale) return;
    if (!canManage) {
      setErrorMessage(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
      return;
    }
    if (noItems) {
      setErrorMessage(
        language === "uz"
          ? "Inventardan kamida 1 ta telefon qo'shing."
          : "Add at least 1 phone from inventory.",
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
    if (paymentType === "PAY_LATER" && !initialPayInput.trim()) {
      const msg =
        language === "uz"
          ? "Initial pay maydonini to'ldiring."
          : "Please fill the Initial pay field.";
      setInitialPayError(msg);
      setErrorMessage(msg);
      return;
    }

    if (effectivePaidNow > total) {
      const msg =
        language === "uz"
          ? "Initial pay phone price'dan katta bo'lishi mumkin emas."
          : "Initial pay cannot be greater than total price.";
      setInitialPayError(msg);
      setErrorMessage(msg);
      return;
    }
    setInitialPayError(null);

    if (paymentType === "PAY_LATER" && remaining < 0) {
      setErrorMessage(
        language === "uz"
          ? "To'langan summa jamidan katta bo'lmasligi kerak."
          : "Paid amount cannot exceed total.",
      );
      return;
    }

    const missingCustomerFields = {
      fullName: requiresCustomer && !customerFullName.trim(),
      phoneNumber: requiresCustomer && !customerPhoneNumber.trim(),
      address: requiresCustomer && !customerAddress.trim(),
    };
    setCustomerFieldInvalid(missingCustomerFields);

    if (missingCustomerFields.fullName || missingCustomerFields.phoneNumber || missingCustomerFields.address) {
      setErrorMessage(
        language === "uz"
          ? "Qarzli sotuv uchun mijoz ma'lumotlarini to'liq kiriting."
          : "Please provide complete customer details for pay-later sale.",
      );
      return;
    }

    const payload: UpdateSalePayload = {
      customer:
        requiresCustomer || customerFullName.trim() || customerPhoneNumber.trim()
          ? {
              fullName: customerFullName.trim(),
              phoneNumber: customerPhoneNumber.trim(),
              address: customerAddress.trim() || undefined,
            }
          : undefined,
      paymentMethod,
      paymentType,
      paidNow: effectivePaidNow,
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

  const availableRows = inventory.filter(
    (item) =>
      (item.status === "IN_STOCK" || item.status === "READY_FOR_SALE") &&
      !cart.some((cartItem) => cartItem.itemId === item.id),
  );

  if (!sale) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[min(92vw,64rem)] h-[90vh] p-0 overflow-hidden rounded-3xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {language === "uz" ? "Sotuvni tahrirlash" : "Edit Sale"}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {language === "uz"
                      ? "Mavjud inventardan telefonlarni tanlang va to'lov ma'lumotini tahrirlang."
                      : "Select phones from available inventory and update payment details."}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
            <div className="rounded-3xl border p-4">
              <div className="space-y-2">
                <Label>{language === "uz" ? "Mavjud telefonlar" : "Available phones"}</Label>
                <Popover open={itemsOpen} onOpenChange={setItemsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="h-10 w-full justify-between rounded-2xl"
                      disabled={!canManage}
                    >
                      {language === "uz"
                        ? "Telefon qidiring va tanlang..."
                        : "Search and select phone..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2" align="start">
                    <div className="space-y-2">
                      <Input
                        className="h-9 rounded-xl"
                        placeholder={
                          language === "uz"
                            ? "IMEI / brand / model bo'yicha qidiring..."
                            : "Search IMEI / brand / model..."
                        }
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />

                      <div
                        className="h-[18rem] overflow-y-auto rounded-xl border overscroll-contain"
                        onWheel={(event) => {
                          const element = event.currentTarget;
                          element.scrollTop += event.deltaY;
                          event.preventDefault();
                        }}
                      >
                        {inventoryLoading ? (
                          <div className="p-3 text-sm text-muted-foreground">
                            {language === "uz" ? "Inventar yuklanmoqda..." : "Loading inventory..."}
                          </div>
                        ) : null}

                        {!inventoryLoading && inventoryError ? (
                          <div className="p-3 text-sm text-rose-600">{inventoryError}</div>
                        ) : null}

                        {!inventoryLoading && !inventoryError && availableRows.length === 0 ? (
                          <div className="p-3 text-sm text-muted-foreground">
                            {language === "uz" ? "Mavjud telefonlar topilmadi." : "No available phones found."}
                          </div>
                        ) : null}

                        {!inventoryLoading && !inventoryError
                          ? availableRows.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                className="flex w-full items-start justify-between gap-2 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted/60"
                                onClick={() => {
                                  addToCart(item);
                                  setItemsOpen(false);
                                }}
                              >
                                <div className="min-w-0">
                                  <div className="truncate text-sm font-medium">
                                    {item.brand} {item.model}
                                  </div>
                                  <div className="truncate text-xs text-muted-foreground">
                                    IMEI: {item.imei} • {language === "uz" ? "Narx" : "Price"}:{" "}
                                    {money(Number(item.purchasePrice))}
                                  </div>
                                </div>
                              </button>
                            ))
                          : null}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
                        placeholder={language === "uz" ? "Sotuv narxi" : "Sale price"}
                        value={item.salePrice > 0 ? String(item.salePrice) : ""}
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
                {cart.length === 0 ? (
                  <div className="rounded-2xl border p-6 text-center text-sm text-muted-foreground">
                    {language === "uz"
                      ? "Sotuvni boshlash uchun inventardan telefon qo'shing."
                      : "Add phones from inventory to start sale."}
                  </div>
                ) : null}
              </div>
            </div>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">{language === "uz" ? "To'lov" : "Payment"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Payment method</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as SalePaymentMethod)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-[--radix-select-trigger-width]">
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
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-[--radix-select-trigger-width]">
                        <SelectItem value="PAID_NOW">Full payment</SelectItem>
                        <SelectItem value="PAY_LATER">Pay later</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paymentType === "PAY_LATER" ? (
                  <div className="space-y-1">
                    <Label>Initial pay</Label>
                    <Input
                      className={cn(
                        "w-full",
                        initialPayError ? "border-destructive focus-visible:ring-destructive/30" : "",
                      )}
                      type="number"
                      inputMode="decimal"
                      placeholder={language === "uz" ? "masalan: 300 000 so'm" : "e.g. 300,000 so'm"}
                      value={initialPayInput}
                      onChange={(event) => {
                        setInitialPayInput(event.target.value.replace(/[^\d.]/g, ""));
                        if (initialPayError) {
                          setInitialPayError(null);
                        }
                      }}
                    />
                    {initialPayError ? (
                      <div
                        role="alert"
                        className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-rose-300/60 bg-rose-500/10 p-3 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold">
                              {language === "uz" ? "Xato" : "Validation error"}
                            </p>
                            <p className="text-sm leading-5">{initialPayError}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="rounded-md border bg-muted/10 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">{money(total)}</span>
                  </div>
                  {paymentType === "PAY_LATER" ? (
                    <div className="mt-2 flex justify-between">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold">{money(Math.max(0, remaining))}</span>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <Label>Notes</Label>
                  <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle className="text-base">{language === "uz" ? "Mijoz" : "Customer"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>
                      Full name {requiresCustomer ? "*" : ""}
                    </Label>
                    <Input
                      className={cn(
                        "w-full",
                        customerFieldInvalid.fullName ? "border-destructive focus-visible:ring-destructive/30" : "",
                      )}
                      value={customerFullName}
                      onChange={(event) => {
                        setCustomerFullName(event.target.value);
                        if (customerFieldInvalid.fullName) {
                          setCustomerFieldInvalid((prev) => ({ ...prev, fullName: false }));
                        }
                      }}
                      placeholder="Customer full name"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>
                      Phone number {requiresCustomer ? "*" : ""}
                    </Label>
                    <Input
                      className={cn(
                        "w-full",
                        customerFieldInvalid.phoneNumber ? "border-destructive focus-visible:ring-destructive/30" : "",
                      )}
                      value={customerPhoneNumber}
                      onChange={(event) => {
                        setCustomerPhoneNumber(event.target.value);
                        if (customerFieldInvalid.phoneNumber) {
                          setCustomerFieldInvalid((prev) => ({ ...prev, phoneNumber: false }));
                        }
                      }}
                      placeholder="+998901234567"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>
                    Address {requiresCustomer ? "*" : ""}
                  </Label>
                  <Input
                    className={cn(
                      "w-full",
                      customerFieldInvalid.address ? "border-destructive focus-visible:ring-destructive/30" : "",
                    )}
                    value={customerAddress}
                    onChange={(event) => {
                      setCustomerAddress(event.target.value);
                      if (customerFieldInvalid.address) {
                        setCustomerFieldInvalid((prev) => ({ ...prev, address: false }));
                      }
                    }}
                    placeholder="Customer address"
                  />
                </div>

                {requiresCustomer ? (
                  <p className="text-xs text-muted-foreground">
                    {language === "uz"
                      ? "Pay later yoki qoldiq bo'lsa, mijoz ma'lumotlari saqlanadi va sotuvga biriktiriladi."
                      : "For pay-later sales, customer details are required and linked to the sale."}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {language === "uz"
                      ? "To'liq to'langan sale uchun customer ma'lumotlari ixtiyoriy."
                      : "Customer details are optional for fully paid sale."}
                  </p>
                )}
              </CardContent>
            </Card>

            {errorMessage ? (
              <div
                role="alert"
                className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-rose-300/60 bg-rose-500/10 p-3 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">
                      {language === "uz" ? "Saqlashda xato" : "Save failed"}
                    </p>
                    <p className="text-sm leading-5">{errorMessage}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <Separator />
          <div className="p-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
              {language === "uz" ? "Bekor qilish" : "Cancel"}
            </Button>
            <Button
              className="rounded-2xl"
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
            >
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
