import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CreateRepairCasePayload, RepairInventoryItem } from "@/lib/api/repairs";
import { useI18n } from "@/lib/i18n/provider";

type RepairStatus = "PENDING" | "DONE";

function statusText(s: RepairInventoryItem["status"]) {
  if (s === "IN_REPAIR") return { en: "In Repair", uz: "Ta'mirda" };
  if (s === "READY_FOR_SALE") return { en: "Ready for Sale", uz: "Sotuvga tayyor" };
  if (s === "SOLD") return { en: "Sold", uz: "Sotilgan" };
  if (s === "RETURNED") return { en: "Returned", uz: "Qaytarilgan" };
  return { en: "In Stock", uz: "Omborda" };
}

function statusPill(s: RepairInventoryItem["status"]) {
  if (s === "IN_REPAIR") return "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15";
  if (s === "READY_FOR_SALE") return "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15";
  if (s === "SOLD") return "bg-slate-500/15 text-slate-700 hover:bg-slate-500/15";
  if (s === "RETURNED") return "bg-rose-500/15 text-rose-700 hover:bg-rose-500/15";
  return "bg-sky-500/15 text-sky-700 hover:bg-sky-500/15";
}

function parseMoney(value: string): number {
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function NewRepairModal({
  open,
  onOpenChange,
  canManage,
  availableItems,
  inventoryLoading,
  inventoryError,
  onSearchInventory,
  onSubmit,
  currentUserId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  canManage: boolean;
  availableItems: RepairInventoryItem[];
  inventoryLoading: boolean;
  inventoryError: string | null;
  onSearchInventory: (value: string) => void;
  onSubmit: (payload: CreateRepairCasePayload) => Promise<void>;
  currentUserId?: number;
}) {
  const { language } = useI18n();
  const [phoneOpen, setPhoneOpen] = React.useState(false);
  const [phoneId, setPhoneId] = React.useState<number | null>(null);
  const [repairStatus, setRepairStatus] = React.useState<RepairStatus>("PENDING");
  const [split, setSplit] = React.useState(false);
  const [markReady, setMarkReady] = React.useState(true);
  const [description, setDescription] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [totalCost, setTotalCost] = React.useState("");
  const [partsCost, setPartsCost] = React.useState("");
  const [laborCost, setLaborCost] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const phone = React.useMemo(
    () => availableItems.find((p) => p.id === phoneId) ?? null,
    [availableItems, phoneId],
  );

  React.useEffect(() => {
    if (!open) return;
    onSearchInventory(search);
  }, [open, search, onSearchInventory]);

  React.useEffect(() => {
    if (!open) {
      setPhoneId(null);
      setRepairStatus("PENDING");
      setSplit(false);
      setMarkReady(true);
      setDescription("");
      setNotes("");
      setSearch("");
      setTotalCost("");
      setPartsCost("");
      setLaborCost("");
      setErrorMessage(null);
      setSaving(false);
    }
  }, [open]);

  React.useEffect(() => {
    if (repairStatus === "DONE") {
      setMarkReady(true);
    }
  }, [repairStatus]);

  async function handleSave() {
    if (!canManage) {
      setErrorMessage(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
      return;
    }

    if (!phoneId) {
      setErrorMessage(language === "uz" ? "Avval telefonni tanlang." : "Select phone first.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage(
        language === "uz" ? "Ta'mir tavsifi kiritilishi shart." : "Repair description is required.",
      );
      return;
    }

    const total = split ? parseMoney(partsCost) + parseMoney(laborCost) : parseMoney(totalCost);
    if (total <= 0) {
      setErrorMessage(
        language === "uz"
          ? "Ta'mir narxi 0 dan katta bo'lishi kerak."
          : "Repair cost must be greater than 0.",
      );
      return;
    }

    const payload: CreateRepairCasePayload = {
      itemId: phoneId,
      description: description.trim(),
      notes: notes.trim() || undefined,
      status: repairStatus,
      assignedTechnicianId: currentUserId,
      costTotal: total,
      partsCost: split ? parseMoney(partsCost) : undefined,
      laborCost: split ? parseMoney(laborCost) : undefined,
    };

    // UI intent: if done and ready toggled, backend can use notes or status transitions.
    if (repairStatus === "DONE" && markReady) {
      payload.notes = payload.notes
        ? `${payload.notes}\n${language === "uz" ? "Sotuvga tayyor deb belgilandi" : "Marked ready for sale"}`
        : language === "uz"
          ? "Sotuvga tayyor deb belgilandi"
          : "Marked ready for sale";
    }

    try {
      setSaving(true);
      setErrorMessage(null);
      await onSubmit(payload);
      onOpenChange(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : language === "uz"
            ? "Ta'mir ishini yaratib bo'lmadi."
            : "Failed to create repair case.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[min(94vw,52rem)] h-[90vh] p-0 overflow-hidden rounded-3xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {language === "uz" ? "Yangi ta'mir" : "New repair"}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {language === "uz"
                      ? "Telefon elementiga ta'mir yozuvini biriktiring va xarajatni kuzating."
                      : "Attach a repair record to a phone item and track costs."}
                  </p>
                </div>

                <Button variant="ghost" size="icon" className="rounded-2xl" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 space-y-6">
            <div className="rounded-3xl border p-4 space-y-3">
              <div className="text-sm font-semibold">{language === "uz" ? "Telefon" : "Phone"}</div>

              <Popover open={phoneOpen} onOpenChange={setPhoneOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between rounded-2xl"
                    disabled={!canManage}
                  >
                    {phone
                      ? `${phone.brand} ${phone.model}`
                      : language === "uz"
                        ? "Telefonni tanlang (IMEI, brend/model bo'yicha qidiring)..."
                        : "Select phone (search IMEI, brand/model)..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder={language === "uz" ? "Telefon qidirish..." : "Search phone..."}
                      value={search}
                      onValueChange={(value) => setSearch(value)}
                    />
                    <CommandEmpty>
                      {inventoryLoading
                        ? language === "uz"
                          ? "Inventar yuklanmoqda..."
                          : "Loading inventory..."
                        : inventoryError ||
                          (language === "uz" ? "Telefon topilmadi." : "No phone found.")}
                    </CommandEmpty>

                    <CommandGroup
                      heading={
                        language === "uz"
                          ? "Mavjudlar (Omborda / Tayyor)"
                          : "Available (In stock / Ready)"
                      }
                    >
                      {availableItems.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={`${p.brand} ${p.model} ${p.imei ?? ""}`}
                          onSelect={() => {
                            setPhoneId(p.id);
                            setPhoneOpen(false);
                          }}
                          className="flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm">{p.brand} {p.model}</div>
                            <div className="truncate text-xs text-muted-foreground">
                              {p.imei ? `IMEI: ${p.imei}` : "IMEI: —"} •{" "}
                              {language === "uz" ? statusText(p.status).uz : statusText(p.status).en}
                            </div>
                          </div>

                          <Check className={cn("h-4 w-4", phoneId === p.id ? "opacity-100" : "opacity-0")} />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {phone && (
                <div className="rounded-2xl border bg-muted/10 p-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-medium">{phone.brand} {phone.model}</div>
                      <div className="text-xs text-muted-foreground">
                        {phone.imei ? `IMEI: ${phone.imei}` : "IMEI: —"}
                      </div>
                    </div>

                    <Badge className={cn("rounded-full", statusPill(phone.status))}>
                      {language === "uz" ? statusText(phone.status).uz : statusText(phone.status).en}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border p-4 space-y-4">
              <div className="text-sm font-semibold">
                {language === "uz" ? "Ta'mir tafsilotlari" : "Repair details"}
              </div>

              <div className="space-y-2">
                <Label>{language === "uz" ? "Ta'mir tavsifi" : "Repair description"}</Label>
                <Textarea
                  placeholder={
                    language === "uz"
                      ? "masalan: ekran almashtirish, batareya muammosi, mikrofon nosozligi..."
                      : "e.g. Screen replacement, battery issue, mic problem..."
                  }
                  className="min-h-[92px] rounded-2xl"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={!canManage}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "uz" ? "Ta'mir holati" : "Repair status"}</Label>
                  <Select
                    value={repairStatus}
                    onValueChange={(value) => setRepairStatus(value as RepairStatus)}
                    disabled={!canManage}
                  >
                    <SelectTrigger className="h-10 rounded-2xl">
                      <SelectValue placeholder={language === "uz" ? "Holat" : "Status"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">{language === "uz" ? "Kutilmoqda" : "Pending"}</SelectItem>
                      <SelectItem value="DONE">{language === "uz" ? "Bajarilgan" : "Done"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">
                    {language === "uz" ? "Narxni qismlar + ish haqi bo'yicha ajratish" : "Split cost into parts + labor"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {language === "uz"
                      ? "Batafsil kuzatish uchun ixtiyoriy taqsimot."
                      : "Optional breakdown for more detailed tracking."}
                  </div>
                </div>
                <Switch checked={split} onCheckedChange={setSplit} disabled={!canManage} />
              </div>

              {!split ? (
                <div className="space-y-2">
                  <Label>{language === "uz" ? "Jami ta'mir narxi" : "Total repair cost"}</Label>
                  <Input
                    inputMode="numeric"
                    placeholder="0"
                    className="h-10 rounded-2xl"
                    value={totalCost}
                    onChange={(event) => setTotalCost(event.target.value)}
                    disabled={!canManage}
                  />
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === "uz" ? "Qismlar narxi" : "Parts cost"}</Label>
                    <Input
                      inputMode="numeric"
                      placeholder="0"
                      className="h-10 rounded-2xl"
                      value={partsCost}
                      onChange={(event) => setPartsCost(event.target.value)}
                      disabled={!canManage}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === "uz" ? "Ish haqi narxi" : "Labor cost"}</Label>
                    <Input
                      inputMode="numeric"
                      placeholder="0"
                      className="h-10 rounded-2xl"
                      value={laborCost}
                      onChange={(event) => setLaborCost(event.target.value)}
                      disabled={!canManage}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>{language === "uz" ? "Izohlar" : "Notes"}</Label>
                <Textarea
                  placeholder={language === "uz" ? "Ixtiyoriy izohlar..." : "Optional notes..."}
                  className="min-h-[80px] rounded-2xl"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  disabled={!canManage}
                />
              </div>
            </div>

            {repairStatus === "DONE" && (
              <div className="rounded-3xl border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">
                      {language === "uz" ? "Telefonni “Sotuvga tayyor” deb belgilash" : "Mark phone as “Ready for Sale”"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === "uz"
                        ? "Ta'mir tugagach, elementni sotuvga ochishingiz mumkin."
                        : "When repair is done, you can make item available for sale."}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">
                      {language === "uz" ? "Standart yoqilgan" : "Default ON"}
                    </Label>
                    <Switch checked={markReady} onCheckedChange={setMarkReady} disabled={!canManage} />
                  </div>
                </div>
              </div>
            )}

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}
          </div>

          <div className="border-t p-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
                {language === "uz" ? "Bekor qilish" : "Cancel"}
              </Button>

              {repairStatus === "DONE" ? (
                <Button className="rounded-2xl" onClick={handleSave} disabled={!canManage || saving}>
                  {language === "uz" ? "Saqlash va sotuvga tayyorlash" : "Save & Mark Ready for Sale"}
                </Button>
              ) : (
                <Button className="rounded-2xl" onClick={handleSave} disabled={!canManage || saving}>
                  {language === "uz" ? "Saqlash" : "Save"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
