import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, WalletCards } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function SalesPageHeader({
  onNewSale,
  canCreate,
}: {
  onNewSale: () => void;
  canCreate: boolean;
}) {
  const { language } = useI18n();
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <WalletCards className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              {language === "uz" ? "Sotuvlar" : "Sales"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === "uz"
              ? "Telefonlarni soting, to'langan/qarzdorlikni kuzating va sotuv tarixini ko'ring."
              : "Sell phones, track paid vs debt, and view sales history."}
          </p>
        </div>

        {canCreate ? (
          <div className="flex items-center gap-2">
            <Button className="rounded-2xl" onClick={onNewSale}>
              <Plus className="mr-2 h-4 w-4" />
              {language === "uz" ? "Yangi sotuv" : "New Sale"}
            </Button>
          </div>
        ) : null}
      </div>
      <Separator />
    </div>
  );
}
