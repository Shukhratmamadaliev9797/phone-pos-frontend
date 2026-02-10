import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {  Pencil, CheckCircle2,  Save, RotateCcw, Plus } from "lucide-react";
import type {
  AddRepairEntryPayload,
  RepairDetail,
  UpdateRepairCasePayload,
} from "@/lib/api/repairs";
import { useI18n } from "@/lib/i18n/provider";

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

function parseNum(v: string) {
  const n = Number(String(v).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function statusPill(status: string) {
  return status === "DONE"
    ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15"
    : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15";
}

function toInputValue(value?: string | number | null): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export function RepairDetailsModal({
  open,
  onOpenChange,
  repair,
  canManage,
  onUpdateCase,
  onAddEntry,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  repair: RepairDetail | null;
  canManage: boolean;
  onUpdateCase: (id: number, payload: UpdateRepairCasePayload) => Promise<void>;
  onAddEntry: (id: number, payload: AddRepairEntryPayload) => Promise<void>;
}) {
  const { language } = useI18n();
  const [isEditing, setIsEditing] = React.useState(false);
  const [status, setStatus] = React.useState<"PENDING" | "DONE">("PENDING");
  const [description, setDescription] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [totalCost, setTotalCost] = React.useState("0");
  const [partsCost, setPartsCost] = React.useState("0");
  const [laborCost, setLaborCost] = React.useState("0");
  const [entryDescription, setEntryDescription] = React.useState("");
  const [entryCost, setEntryCost] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!repair) return;

    setIsEditing(false);
    setStatus((repair.status === "DONE" ? "DONE" : "PENDING") as "PENDING" | "DONE");
    setDescription(repair.description ?? "");
    setNotes(repair.notes ?? "");
    setTotalCost(toInputValue(repair.costTotal));
    setPartsCost(toInputValue(repair.partsCost));
    setLaborCost(toInputValue(repair.laborCost));
    setEntryDescription("");
    setEntryCost("");
    setBusy(false);
    setError(null);
  }, [repair, open]);

  if (!repair) return null;

  const currentRepair = repair;
  const entries = currentRepair.entries ?? [];
  const previewTotal = parseNum(totalCost);

  const onCancelEdit = () => {
    setIsEditing(false);
    setStatus((currentRepair.status === "DONE" ? "DONE" : "PENDING") as "PENDING" | "DONE");
    setDescription(currentRepair.description ?? "");
    setNotes(currentRepair.notes ?? "");
    setTotalCost(toInputValue(currentRepair.costTotal));
    setPartsCost(toInputValue(currentRepair.partsCost));
    setLaborCost(toInputValue(currentRepair.laborCost));
    setError(null);
  };

  async function handleSave() {
    if (!canManage) {
      setError(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
      return;
    }

    if (!description.trim()) {
      setError(language === "uz" ? "Tavsif kiritilishi shart" : "Description is required");
      return;
    }

    try {
      setBusy(true);
      setError(null);
      await onUpdateCase(currentRepair.id, {
        status,
        description: description.trim(),
        notes: notes.trim() || undefined,
        costTotal: parseNum(totalCost),
        partsCost: partsCost.trim() ? parseNum(partsCost) : undefined,
        laborCost: laborCost.trim() ? parseNum(laborCost) : undefined,
      });
      setIsEditing(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Ta'mir ishini yangilab bo'lmadi"
            : "Failed to update repair case",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleAddEntry() {
    if (!canManage) {
      setError(language === "uz" ? "Ruxsat yo'q" : "Not allowed");
      return;
    }

    if (!entryDescription.trim()) {
      setError(language === "uz" ? "Band tavsifi kiritilishi shart" : "Entry description is required");
      return;
    }

    const entryAmount = parseNum(entryCost);
    if (entryAmount <= 0) {
      setError(language === "uz" ? "Band narxi 0 dan katta bo'lishi kerak" : "Entry cost must be greater than 0");
      return;
    }

    try {
      setBusy(true);
      setError(null);
      await onAddEntry(currentRepair.id, {
        description: entryDescription.trim(),
        costTotal: entryAmount,
      });
      setEntryDescription("");
      setEntryCost("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Ta'mir bandini qo'shib bo'lmadi"
            : "Failed to add repair entry",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) setIsEditing(false);
      onOpenChange(v);
    }}>
      <DialogContent className="max-w-4xl w-[min(94vw,56rem)] h-[90vh] p-0 overflow-hidden rounded-3xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {language === "uz" ? "Ta'mir tafsilotlari" : "Repair details"}
                    {isEditing && (
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {language === "uz" ? "(Tahrirlanmoqda)" : "(Editing)"}
                      </span>
                    )}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    #{currentRepair.id} • {new Date(currentRepair.repairedAt || currentRepair.createdAt || Date.now()).toLocaleString()}
                  </p>
                </div>

                
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 space-y-6">
            <div className="rounded-3xl border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    {currentRepair.item?.brand ?? (language === "uz" ? "Telefon" : "Phone")}{" "}
                    {currentRepair.item?.model ?? ""}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {currentRepair.item?.imei ? `IMEI: ${currentRepair.item.imei}` : "IMEI: —"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("rounded-full", statusPill(isEditing ? status : currentRepair.status))}>
                    {(isEditing ? status : currentRepair.status) === "DONE"
                      ? language === "uz"
                        ? "Bajarilgan"
                        : "Done"
                      : language === "uz"
                        ? "Kutilmoqda"
                        : "Pending"}
                  </Badge>

                  <Badge variant="secondary" className="rounded-full">
                    {currentRepair.technician?.fullName ||
                      currentRepair.technician?.username ||
                      (language === "uz" ? "Biriktirilmagan" : "Unassigned")}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    {language === "uz" ? "Ta'mir ma'lumotlari" : "Repair info"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === "uz" ? "Tavsif, izohlar va narxlar." : "Description, notes and costs."}
                  </div>
                </div>

                {!isEditing && canManage ? (
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {language === "uz" ? "Tahrirlash" : "Edit"}
                  </Button>
                ) : null}
              </div>

              <Separator />

              {isEditing ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{language === "uz" ? "Ta'mir holati" : "Repair status"}</Label>
                    <Select value={status} onValueChange={(v) => setStatus(v as "PENDING" | "DONE")}> 
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
              ) : null}

              <div className="space-y-2">
                <Label>{language === "uz" ? "Tavsif" : "Description"}</Label>
                {isEditing ? (
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={language === "uz" ? "Ta'mir tavsifini kiriting..." : "Describe the repair..."}
                    className="min-h-[92px] rounded-2xl"
                  />
                ) : (
                  <div className="rounded-2xl border bg-muted/10 p-3 text-sm text-muted-foreground">
                    {currentRepair.description?.trim() ? currentRepair.description : "—"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{language === "uz" ? "Izohlar" : "Notes"}</Label>
                {isEditing ? (
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={language === "uz" ? "Ixtiyoriy izohlar..." : "Optional notes..."}
                    className="min-h-[80px] rounded-2xl"
                  />
                ) : (
                  <div className="rounded-2xl border bg-muted/10 p-3 text-sm text-muted-foreground">
                    {currentRepair.notes?.trim() ? currentRepair.notes : "—"}
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>{language === "uz" ? "Jami narx" : "Total cost"}</Label>
                  {isEditing ? (
                    <Input
                      value={totalCost}
                      onChange={(e) => setTotalCost(e.target.value)}
                      inputMode="numeric"
                      placeholder="0"
                      className="h-10 rounded-2xl"
                    />
                  ) : (
                    <div className="rounded-2xl border bg-muted/10 p-3 text-sm">
                      <span className="font-medium">{money(Number(currentRepair.costTotal ?? 0))}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{language === "uz" ? "Qismlar narxi" : "Parts cost"}</Label>
                  <Input
                    value={partsCost}
                    onChange={(e) => setPartsCost(e.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                    className="h-10 rounded-2xl"
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === "uz" ? "Ish haqi narxi" : "Labor cost"}</Label>
                  <Input
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                    className="h-10 rounded-2xl"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="rounded-2xl border bg-muted/10 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    {language === "uz" ? "Oldindan jami" : "Preview total"}
                  </div>
                  <div className="text-sm font-semibold">{money(previewTotal)}</div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">
                  {language === "uz" ? "Ta'mir bandlari" : "Repair entries"}
                </div>
              </div>

              {entries.length === 0 ? (
                <div className="rounded-2xl border bg-muted/10 p-3 text-sm text-muted-foreground">
                  {language === "uz" ? "Hali bandlar yo'q." : "No entries yet."}
                </div>
              ) : (
                <div className="space-y-2">
                  {entries.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border bg-muted/10 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium">{entry.description}</div>
                        <div className="text-sm font-semibold">{money(Number(entry.costTotal ?? 0))}</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.entryAt || entry.repairedAt || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {canManage ? (
                <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
                  <Input
                    placeholder={language === "uz" ? "Band tavsifi" : "Entry description"}
                    value={entryDescription}
                    onChange={(event) => setEntryDescription(event.target.value)}
                    className="h-10 rounded-2xl"
                  />
                  <Input
                    placeholder={language === "uz" ? "Narx" : "Cost"}
                    value={entryCost}
                    onChange={(event) => setEntryCost(event.target.value)}
                    inputMode="numeric"
                    className="h-10 rounded-2xl"
                  />
                  <Button className="rounded-2xl" onClick={handleAddEntry} disabled={busy}>
                    <Plus className="mr-2 h-4 w-4" />
                    {language === "uz" ? "Band qo'shish" : "Add entry"}
                  </Button>
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </div>

          <div className="border-t p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
                {language === "uz" ? "Yopish" : "Close"}
              </Button>

              {canManage ? (
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  {isEditing ? (
                    <>
                      <Button variant="outline" className="rounded-2xl" onClick={onCancelEdit}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {language === "uz" ? "Bekor qilish" : "Cancel"}
                      </Button>

                      <Button className="rounded-2xl" onClick={handleSave} disabled={busy}>
                        <Save className="mr-2 h-4 w-4" />
                        {language === "uz" ? "O'zgarishlarni saqlash" : "Save changes"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => {
                          if (currentRepair.status === "DONE") return;
                          void onUpdateCase(currentRepair.id, { status: "DONE" });
                        }}
                        disabled={currentRepair.status === "DONE"}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {language === "uz" ? "Bajarildi deb belgilash" : "Mark Done"}
                      </Button>

                      
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
