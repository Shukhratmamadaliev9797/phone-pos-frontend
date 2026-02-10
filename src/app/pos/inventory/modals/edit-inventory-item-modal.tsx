import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InventoryRow } from "../components/inventory-table";
import type {
  InventoryCondition,
  InventoryStatus,
  UpdateInventoryItemPayload,
} from "@/lib/api/inventory";
import { useI18n } from "@/lib/i18n/provider";

type FormValue = {
  imei: string;
  serialNumber: string;
  brand: string;
  model: string;
  condition: InventoryCondition;
  status: InventoryStatus;
  knownIssues: string;
  expectedSalePrice: string;
};

function toInitial(item: InventoryRow | null): FormValue {
  return {
    imei: item?.imei ?? "",
    serialNumber: "",
    brand: item?.brand ?? "",
    model: item?.model ?? "",
    condition: item?.condition ?? "USED",
    status: item?.status ?? "IN_STOCK",
    knownIssues: item?.knownIssues ?? "",
    expectedSalePrice:
      item?.expectedPrice !== undefined ? String(item.expectedPrice) : "",
  };
}

export function EditInventoryItemModal({
  open,
  onOpenChange,
  item,
  canEdit,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: InventoryRow | null;
  canEdit: boolean;
  onSave: (id: number, payload: UpdateInventoryItemPayload) => Promise<void>;
}) {
  const { language } = useI18n();
  const [value, setValue] = React.useState<FormValue>(toInitial(item));
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setValue(toInitial(item));
      setSaving(false);
      setError(null);
    }
  }, [open, item]);

  const canSubmit =
    canEdit &&
    !saving &&
    value.imei.trim().length > 0 &&
    value.brand.trim().length > 0 &&
    value.model.trim().length > 0;

  async function handleSave() {
    if (!item) return;
    if (!canEdit) {
      setError(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
      return;
    }
    if (!canSubmit) {
      setError(language === "uz" ? "Majburiy maydonlarni to'ldiring." : "Please fill required fields.");
      return;
    }

    const payload: UpdateInventoryItemPayload = {
      imei: value.imei.trim(),
      serialNumber: value.serialNumber.trim() || null,
      brand: value.brand.trim(),
      model: value.model.trim(),
      condition: value.condition,
      status: value.status,
      knownIssues: value.knownIssues.trim() || null,
      expectedSalePrice: value.expectedSalePrice.trim()
        ? Number(value.expectedSalePrice)
        : null,
    };

    try {
      setSaving(true);
      setError(null);
      await onSave(Number(item.id), payload);
      onOpenChange(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Telefon ma'lumotlarini yangilab bo'lmadi."
            : "Failed to update phone details.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>{language === "uz" ? "Telefon ma'lumotlarini tahrirlash" : "Edit phone details"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>IMEI</Label>
            <Input
              value={value.imei}
              onChange={(e) => setValue((p) => ({ ...p, imei: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "uz" ? "Seriya raqami" : "Serial Number"}</Label>
            <Input
              value={value.serialNumber}
              onChange={(e) =>
                setValue((p) => ({ ...p, serialNumber: e.target.value }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "uz" ? "Brend" : "Brand"}</Label>
            <Input
              value={value.brand}
              onChange={(e) => setValue((p) => ({ ...p, brand: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{language === "uz" ? "Model" : "Model"}</Label>
            <Input
              value={value.model}
              onChange={(e) => setValue((p) => ({ ...p, model: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "uz" ? "Holati" : "Condition"}</Label>
            <Select
              value={value.condition}
              onValueChange={(v) =>
                setValue((p) => ({ ...p, condition: v as InventoryCondition }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GOOD">{language === "uz" ? "Yaxshi" : "Good"}</SelectItem>
                <SelectItem value="USED">{language === "uz" ? "Ishlatilgan" : "Used"}</SelectItem>
                <SelectItem value="BROKEN">{language === "uz" ? "Nosoz" : "Broken"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === "uz" ? "Holat" : "Status"}</Label>
            <Select
              value={value.status}
              onValueChange={(v) =>
                setValue((p) => ({ ...p, status: v as InventoryStatus }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_STOCK">{language === "uz" ? "Omborda" : "In Stock"}</SelectItem>
                <SelectItem value="IN_REPAIR">{language === "uz" ? "Ta'mirda" : "In Repair"}</SelectItem>
                <SelectItem value="READY_FOR_SALE">
                  {language === "uz" ? "Sotuvga tayyor" : "Ready for Sale"}
                </SelectItem>
                <SelectItem value="SOLD">{language === "uz" ? "Sotilgan" : "Sold"}</SelectItem>
                <SelectItem value="RETURNED">{language === "uz" ? "Qaytarilgan" : "Returned"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>{language === "uz" ? "Kutilgan sotuv narxi" : "Expected Sale Price"}</Label>
            <Input
              placeholder={language === "uz" ? "masalan: 6500000" : "e.g. 6500000"}
              inputMode="decimal"
              value={value.expectedSalePrice}
              onChange={(e) =>
                setValue((p) => ({
                  ...p,
                  expectedSalePrice: e.target.value.replace(/[^\d.]/g, ""),
                }))
              }
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>{language === "uz" ? "Ma'lum nosozliklar" : "Known Issues"}</Label>
            <Textarea
              value={value.knownIssues}
              onChange={(e) =>
                setValue((p) => ({ ...p, knownIssues: e.target.value }))
              }
            />
          </div>
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === "uz" ? "Bekor qilish" : "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={!canSubmit}>
            {saving
              ? language === "uz"
                ? "Saqlanmoqda..."
                : "Saving..."
              : language === "uz"
                ? "Saqlash"
                : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
