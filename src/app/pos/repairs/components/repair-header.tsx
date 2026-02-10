import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function RepairsPageHeader({
  onNewRepair,
  canCreate = true,
}: {
  onNewRepair?: () => void;
  canCreate?: boolean;
}) {
  const { language } = useI18n();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {language === "uz" ? "Ta'mirlar" : "Repairs"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === "uz" ? "Ta'mir xarajatlari va holatlari" : "Repair costs and statuses"}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">

        {canCreate ? (
          <Button className="rounded-2xl" onClick={onNewRepair}>
            <Plus className="mr-2 h-4 w-4" />
            {language === "uz" ? "Yangi ta'mir" : "New Repair"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
