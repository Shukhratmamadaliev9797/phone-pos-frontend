import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
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

function inventoryStatusText(status?: string, language: string = "en") {
  if (status === "IN_REPAIR") return language === "uz" ? "Ta'mirda" : "In repair";
  if (status === "READY_FOR_SALE") return language === "uz" ? "Sotuvga tayyor" : "Ready for sale";
  if (status === "SOLD") return language === "uz" ? "Sotilgan" : "Sold";
  if (status === "RETURNED") return language === "uz" ? "Qaytarilgan" : "Returned";
  return language === "uz" ? "Omborda" : "In stock";
}

function conditionText(condition?: string, language: string = "en") {
  if (condition === "GOOD") return language === "uz" ? "Yaxshi" : "Good";
  if (condition === "BROKEN") return language === "uz" ? "Nosoz" : "Broken";
  return language === "uz" ? "Ishlatilgan" : "Used";
}

export function RepairDetailsModal({
  open,
  onOpenChange,
  repair,
  canManage,
  onUpdateCase,
  onAddEntry,
  onDeleteEntry,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  repair: RepairDetail | null;
  canManage: boolean;
  onUpdateCase: (id: number, payload: UpdateRepairCasePayload) => Promise<void>;
  onAddEntry: (id: number, payload: AddRepairEntryPayload) => Promise<void>;
  onDeleteEntry: (entryId: number) => Promise<void>;
}) {
  const { language } = useI18n();
  const [entriesOpen, setEntriesOpen] = React.useState(false);
  const [editInfoOpen, setEditInfoOpen] = React.useState(false);
  const [editDescription, setEditDescription] = React.useState("");
  const [editNotes, setEditNotes] = React.useState("");
  const [savingInfo, setSavingInfo] = React.useState(false);
  const [entryDescription, setEntryDescription] = React.useState("");
  const [entryCost, setEntryCost] = React.useState("");
  const [addingEntry, setAddingEntry] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!repair) return;
    setEditDescription(repair.description ?? "");
    setEditNotes(repair.notes ?? "");
    setEditInfoOpen(false);
    setSavingInfo(false);
    setEntryDescription("");
    setEntryCost("");
    setEntriesOpen(false);
    setAddingEntry(false);
    setError(null);
  }, [repair, open]);

  if (!repair) return null;

  const currentRepair = repair;
  const previewTotal = Number(currentRepair.costTotal ?? 0);
  const entries = currentRepair.entries ?? [];

  async function handleSaveInfo() {
    if (!canManage) return;
    try {
      setSavingInfo(true);
      setError(null);
      await onUpdateCase(currentRepair.id, {
        description: editDescription.trim() || undefined,
        notes: editNotes.trim() || undefined,
      });
      setEditInfoOpen(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Ta'mir ma'lumotini yangilab bo'lmadi"
            : "Failed to update repair info",
      );
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleAddEntry() {
    if (!canManage) return;

    if (!entryDescription.trim()) {
      setError(
        language === "uz"
          ? "Xarajat tavsifi kiritilishi shart"
          : "Cost description is required",
      );
      return;
    }

    const amount = parseNum(entryCost);
    if (amount <= 0) {
      setError(
        language === "uz"
          ? "Xarajat summasi 0 dan katta bo'lishi kerak"
          : "Cost amount must be greater than 0",
      );
      return;
    }

    try {
      setAddingEntry(true);
      setError(null);
      await onAddEntry(currentRepair.id, {
        description: entryDescription.trim(),
        costTotal: amount,
      });
      setEntryDescription("");
      setEntryCost("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Xarajatni qo'shib bo'lmadi"
            : "Failed to add cost update",
      );
    } finally {
      setAddingEntry(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[min(94vw,56rem)] h-[90vh] p-0 overflow-hidden rounded-2xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {language === "uz" ? "Ta'mir tafsilotlari" : "Repair details"}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(
                      currentRepair.repairedAt || currentRepair.createdAt || Date.now(),
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 space-y-6">
            <div className="rounded-2xl border p-4">
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
                  <Badge className={cn("rounded-2xl", statusPill(currentRepair.status))}>
                    {currentRepair.status === "DONE"
                      ? language === "uz"
                        ? "Bajarilgan"
                        : "Done"
                      : language === "uz"
                        ? "Kutilmoqda"
                        : "Pending"}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border px-3 py-2">
                  <div className="text-xs text-muted-foreground">IMEI</div>
                  <div className="text-sm font-medium break-all">
                    {currentRepair.item?.imei || "—"}
                  </div>
                </div>
                <div className="rounded-2xl border px-3 py-2">
                  <div className="text-xs text-muted-foreground">
                    {language === "uz" ? "Xotira" : "Storage"}
                  </div>
                  <div className="text-sm font-medium">{currentRepair.item?.storage || "—"}</div>
                </div>
                <div className="rounded-2xl border px-3 py-2">
                  <div className="text-xs text-muted-foreground">
                    {language === "uz" ? "Holati" : "Condition"}
                  </div>
                  <div className="text-sm font-medium">
                    {conditionText(currentRepair.item?.condition, language)}
                  </div>
                </div>
                <div className="rounded-2xl border px-3 py-2">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="text-sm font-medium">
                    {inventoryStatusText(currentRepair.item?.status, language)}
                  </div>
                </div>
              </div>

              {currentRepair.item?.knownIssues ? (
                <div className="mt-3 rounded-2xl border px-3 py-2">
                  <div className="text-xs text-muted-foreground">
                    {language === "uz" ? "Aniqlangan muammolar" : "Known issues"}
                  </div>
                  <div className="text-sm font-medium break-words">
                    {currentRepair.item.knownIssues}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border p-4 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    {language === "uz" ? "Ta'mir ma'lumotlari" : "Repair info"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {language === "uz"
                      ? "Tavsif, izohlar va narxlar."
                      : "Description, notes and costs."}
                  </div>
                </div>
                {canManage ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => setEditInfoOpen(true)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    {language === "uz" ? "Tahrirlash" : "Edit"}
                  </Button>
                ) : null}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>{language === "uz" ? "Tavsif" : "Description"}</Label>
                <div className="rounded-2xl border bg-muted/10 p-3 text-sm text-muted-foreground">
                  {currentRepair.description?.trim() ? currentRepair.description : "—"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === "uz" ? "Izohlar" : "Notes"}</Label>
                <div className="rounded-2xl border bg-muted/10 p-3 text-sm text-muted-foreground">
                  {currentRepair.notes?.trim() ? currentRepair.notes : "—"}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border p-4 space-y-4">
              <div className="text-sm font-semibold">
                {language === "uz" ? "Ta'mir xarajatlari" : "Repair costs"}
              </div>

              <div className="space-y-2">
                <Label>{language === "uz" ? "Xarajat yozuvlari" : "Cost updates"}</Label>
                {entries.length === 0 ? (
                  <div className="rounded-2xl border bg-muted/10 p-3 text-sm text-muted-foreground">
                    {language === "uz" ? "Hali xarajat kiritilmagan." : "No cost updates yet."}
                  </div>
                ) : (
                  <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                    {entries
                      .slice()
                      .sort((a, b) => {
                        const aTime = new Date(a.entryAt || a.repairedAt || 0).getTime();
                        const bTime = new Date(b.entryAt || b.repairedAt || 0).getTime();
                        return bTime - aTime;
                      })
                      .map((entry) => (
                        <div key={entry.id} className="rounded-2xl border bg-muted/10 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium">{entry.description || "—"}</div>
                            <div className="text-sm font-semibold">
                              {money(Number(entry.costTotal ?? 0))}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {new Date(entry.entryAt || entry.repairedAt || Date.now()).toLocaleString()}
                          </div>
                          {canManage ? (
                            <div className="mt-2 flex justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-2xl border-rose-300 text-rose-700 hover:bg-rose-50"
                                onClick={async () => {
                                  try {
                                    setError(null);
                                    await onDeleteEntry(entry.id);
                                  } catch (requestError) {
                                    setError(
                                      requestError instanceof Error
                                        ? requestError.message
                                        : language === "uz"
                                          ? "Xarajat yozuvini o'chirib bo'lmadi"
                                          : "Failed to delete cost update",
                                    );
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {language === "uz" ? "O'chirish" : "Delete"}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{language === "uz" ? "Jami narx" : "Total cost"}</Label>
                <div className="rounded-2xl border bg-muted/10 p-3 text-sm">
                  <span className="font-medium">{money(previewTotal)}</span>
                </div>
              </div>

              <Button
                type="button"
                className="w-full rounded-2xl"
                onClick={() => setEntriesOpen(true)}
              >
                {language === "uz" ? "Ta'mir xarajatini yangilash" : "Update repair cost"}
              </Button>
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
                  <Button
                    variant="outline"
                    className="rounded-2xl"
                    onClick={() => {
                      if (currentRepair.status === "DONE") return;
                      void onUpdateCase(currentRepair.id, {
                        status: "DONE",
                      });
                    }}
                    disabled={currentRepair.status === "DONE"}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {language === "uz" ? "Bajarildi deb belgilash" : "Mark Done"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>

      <Dialog open={entriesOpen} onOpenChange={setEntriesOpen}>
        <DialogContent className="max-w-2xl w-[min(94vw,42rem)] h-[78vh] p-0 overflow-hidden rounded-2xl">
          <div className="flex h-full min-h-0 flex-col">
            <div className="border-b p-6">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {language === "uz" ? "Xarajat tarixi" : "Cost updates"}
                </DialogTitle>
              </DialogHeader>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
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
                        <div className="text-sm font-semibold">
                          {money(Number(entry.costTotal ?? 0))}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(entry.entryAt || entry.repairedAt || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {canManage ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder={language === "uz" ? "Xarajat tavsifi" : "Cost description"}
                    value={entryDescription}
                    onChange={(event) => setEntryDescription(event.target.value)}
                    className="min-h-[92px] rounded-2xl"
                  />
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <Input
                      placeholder={language === "uz" ? "Xarajat summasi" : "Cost amount"}
                      value={entryCost}
                      onChange={(event) => setEntryCost(event.target.value)}
                      inputMode="numeric"
                      className="h-10 rounded-2xl"
                    />
                    <Button
                      className="rounded-2xl sm:min-w-[170px]"
                      onClick={handleAddEntry}
                      disabled={addingEntry}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {language === "uz" ? "Xarajat qo'shish" : "Add cost"}
                    </Button>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editInfoOpen} onOpenChange={setEditInfoOpen}>
        <DialogContent className="max-w-xl w-[min(94vw,36rem)] p-0 overflow-hidden rounded-2xl">
          <div className="border-b p-6">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {language === "uz" ? "Ta'mir ma'lumotini tahrirlash" : "Edit repair info"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>{language === "uz" ? "Tavsif" : "Description"}</Label>
              <Textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                className="min-h-[92px] rounded-2xl"
                placeholder={language === "uz" ? "Ta'mir tavsifi" : "Repair description"}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === "uz" ? "Izohlar" : "Notes"}</Label>
              <Textarea
                value={editNotes}
                onChange={(event) => setEditNotes(event.target.value)}
                className="min-h-[92px] rounded-2xl"
                placeholder={language === "uz" ? "Qo'shimcha izohlar" : "Additional notes"}
              />
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                className="rounded-2xl"
                onClick={() => setEditInfoOpen(false)}
              >
                {language === "uz" ? "Bekor qilish" : "Cancel"}
              </Button>
              <Button
                className="rounded-2xl"
                onClick={handleSaveInfo}
                disabled={savingInfo}
              >
                {language === "uz" ? "Saqlash" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
