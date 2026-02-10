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
import type {
  CreateInventoryItemPayload,
  InventoryCondition,
  InventoryStatus,
} from "@/lib/api/inventory";
import { useI18n } from "@/lib/i18n/provider";

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

const INITIAL_FORM: FormValue = {
  imei: "",
  brand: "",
  model: "",
  storage: "",
  condition: "USED",
  status: "IN_STOCK",
  knownIssues: "",
  expectedSalePrice: "",
};

export function AddPhoneModal({
  open,
  onOpenChange,
  canManage,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  canManage: boolean;
  onCreate: (payload: CreateInventoryItemPayload) => Promise<void>;
}) {
  const { language } = useI18n();
  const [value, setValue] = React.useState<FormValue>(INITIAL_FORM);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setValue(INITIAL_FORM);
      setSaving(false);
      setError(null);
    }
  }, [open]);

  const canSubmit =
    canManage &&
    !saving &&
    value.imei.trim().length > 0 &&
    value.brand.trim().length > 0 &&
    value.model.trim().length > 0 &&
    Number(value.expectedSalePrice) >= 0;

  async function handleSave() {
    if (!canManage) {
      setError(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
      return;
    }
    if (!canSubmit) {
      setError(language === "uz" ? "Majburiy maydonlarni to'ldiring." : "Please fill required fields.");
      return;
    }

    const payload: CreateInventoryItemPayload = {
      imei: value.imei.trim(),
      brand: value.brand.trim(),
      model: value.model.trim(),
      storage: value.storage.trim() || undefined,
      condition: value.condition,
      status: value.status,
      knownIssues: value.knownIssues.trim() || undefined,
      expectedSalePrice: Number(value.expectedSalePrice),
    };

    try {
      setSaving(true);
      setError(null);
      await onCreate(payload);
      onOpenChange(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Telefon qo'shib bo'lmadi."
            : "Failed to add phone.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>{language === "uz" ? "Telefon qo'shish" : "Add phone"}</DialogTitle>
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
            <Label>{language === "uz" ? "Xotira" : "Storage"}</Label>
            <Input
              value={value.storage}
              onChange={(e) => setValue((p) => ({ ...p, storage: e.target.value }))}
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
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>{language === "uz" ? "Sotuv narxi" : "Sale Price"}</Label>
            <Input
              inputMode="decimal"
              placeholder={language === "uz" ? "masalan: 6500000" : "e.g. 6500000"}
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
                ? "Telefon qo'shish"
                : "Add phone"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
