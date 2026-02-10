import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";

type CustomerType = "DEBT" | "CREDIT";


export function CustomerPaymentModal({
  open,
  onOpenChange,
  type,
  customerName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  type: CustomerType; // ✅ DEBT | CREDIT
  customerName: string;
}) {
  const { language } = useI18n();
  const isDebt = type === "DEBT";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[min(92vw,36rem)] p-0 overflow-hidden rounded-3xl">
        <div className="flex flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {isDebt
                      ? language === "uz"
                        ? "To'lov qo'shish (Qarz)"
                        : "Add Payment (Debt)"
                      : language === "uz"
                        ? "Mijozga to'lash (Kredit)"
                        : "Pay Customer (Credit)"}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{customerName}</p>
                </div>

                <Button variant="ghost" size="icon" className="rounded-2xl" onClick={() => onOpenChange(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            <Badge
              className={
                isDebt
                  ? "rounded-full bg-rose-500/15 text-rose-700 hover:bg-rose-500/15"
                  : "rounded-full bg-amber-500/15 text-amber-700 hover:bg-amber-500/15"
              }
            >
              {isDebt
                ? language === "uz"
                  ? "Mijoz → Do'kon (qarzni kamaytiradi)"
                  : "Customer → Shop (reduces Debt)"
                : language === "uz"
                  ? "Do'kon → Mijoz (kreditni kamaytiradi)"
                  : "Shop → Customer (reduces Credit)"}
            </Badge>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>{language === "uz" ? "Summa" : "Amount"}</Label>
                <Input type="number" className="h-10 rounded-2xl" placeholder="0" />
              </div>

              <div className="space-y-1">
                <Label>{language === "uz" ? "Usul" : "Method"}</Label>
                <Select defaultValue="CASH">
                  <SelectTrigger className="h-10 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">{language === "uz" ? "Naqd" : "Cash"}</SelectItem>
                    <SelectItem value="CARD">{language === "uz" ? "Karta" : "Card"}</SelectItem>
                    <SelectItem value="OTHER">{language === "uz" ? "Boshqa" : "Other"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>{language === "uz" ? "Qo'llash" : "Apply"}</Label>
              <Select defaultValue="OLDEST">
                <SelectTrigger className="h-10 rounded-2xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OLDEST">
                    {language === "uz"
                      ? `Eng eski ${isDebt ? "qarz" : "kredit"}ga qo'llash (FIFO)`
                      : `Apply to oldest ${isDebt ? "debt" : "credit"} (FIFO)`}
                  </SelectItem>
                  <SelectItem value="MANUAL">
                    {language === "uz" ? "Qo'lda taqsimlash (keyinroq)" : "Manual allocation (later)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>{language === "uz" ? "Izohlar" : "Notes"}</Label>
              <Textarea placeholder={language === "uz" ? "Ixtiyoriy izoh..." : "Optional notes..."} />
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
                {language === "uz" ? "Bekor qilish" : "Cancel"}
              </Button>
              <Button className="rounded-2xl" onClick={() => console.log("save payment")}>
                {language === "uz" ? "Saqlash" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
