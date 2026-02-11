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
import {
  getPhoneModelsByBrand,
  PHONE_BRAND_OPTIONS,
  PHONE_STORAGE_OPTIONS,
} from "@/lib/constants/phone-options";

type FormValue = {
  imei: string;
  brand: string;
  model: string;
  storage: string;
  condition: InventoryCondition;
  status: InventoryStatus;
  knownIssues: string;
  expectedSalePrice: string;
};

function toInitial(item: InventoryRow | null): FormValue {
  return {
    imei: item?.imei ?? "",
    brand: item?.brand ?? "",
    model: item?.model ?? "",
    storage: item?.storage ?? "",
    condition: item?.condition ?? "USED",
    status: item?.status ?? "READY_FOR_SALE",
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
  const modelOptions = React.useMemo(
    () => getPhoneModelsByBrand(value.brand),
    [value.brand],
  );

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
    value.model.trim().length > 0 &&
    Number(value.expectedSalePrice) >= 0;

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
      brand: value.brand.trim(),
      model: value.model.trim(),
      storage: value.storage.trim() || null,
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
            <Label>{language === "uz" ? "Brend" : "Brand"}</Label>
            <Select
              value={value.brand || undefined}
              onValueChange={(selected) =>
                setValue((p) => ({ ...p, brand: selected, model: "" }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    language === "uz" ? "Brendni tanlang" : "Select brand"
                  }
                />
              </SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width]">
                {PHONE_BRAND_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === "uz" ? "Model" : "Model"}</Label>
            <Select
              value={value.model || undefined}
              onValueChange={(selected) =>
                setValue((p) => ({ ...p, model: selected }))
              }
              disabled={!value.brand}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !value.brand
                      ? language === "uz"
                        ? "Avval brendni tanlang"
                        : "Select brand first"
                      : language === "uz"
                        ? "Modelni tanlang"
                        : "Select model"
                  }
                />
              </SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width]">
                {modelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === "uz" ? "Xotira" : "Storage"}</Label>
            <Select
              value={value.storage}
              onValueChange={(selected) =>
                setValue((p) => ({ ...p, storage: selected }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    language === "uz" ? "Xotirani tanlang" : "Select storage"
                  }
                />
              </SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width]">
                {PHONE_STORAGE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{language === "uz" ? "Holati" : "Condition"}</Label>
            <Select
              value={value.condition}
              onValueChange={(v) =>
                setValue((p) => ({ ...p, condition: v as InventoryCondition }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width]">
                <SelectItem value="GOOD">{language === "uz" ? "Yaxshi" : "Good"}</SelectItem>
                <SelectItem value="USED">{language === "uz" ? "Ishlatilgan" : "Used"}</SelectItem>
                <SelectItem value="BROKEN">{language === "uz" ? "Nosoz" : "Broken"}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>IMEI</Label>
            <Input
              value={value.imei}
              onChange={(e) => setValue((p) => ({ ...p, imei: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "uz" ? "Holat" : "Status"}</Label>
            <Select
              value={value.status}
              onValueChange={(v) =>
                setValue((p) => ({ ...p, status: v as InventoryStatus }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="w-[--radix-select-trigger-width]">
                <SelectItem value="IN_REPAIR">{language === "uz" ? "Ta'mirda" : "In Repair"}</SelectItem>
                <SelectItem value="READY_FOR_SALE">
                  {language === "uz" ? "Sotuvga tayyor" : "Ready for Sale"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>{language === "uz" ? "Narx" : "Price"}</Label>
            <Input
              placeholder={language === "uz" ? "masalan: 6 500 000 so'm" : "e.g. 6,500,000 so'm"}
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
