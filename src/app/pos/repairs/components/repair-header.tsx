import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus, Wrench } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              {language === "uz" ? "Ta'mirlar" : "Repairs"}
            </h1>
          </div>
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
      <Separator />
    </div>
  );
}
