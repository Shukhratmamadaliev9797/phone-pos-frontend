import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function ReportsPageHeader({
  onExportPdf,
}: {
  onExportPdf?: () => void;
}) {
  const { language } = useI18n();

  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xl font-semibold">
              {language === "uz" ? "Hisobotlar" : "Reports"}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {language === "uz"
                ? "Sotuv, xarid, ta'mir, balans va ish haqi"
                : "Sales, purchases, repairs, balances and salaries"}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-2xl">
                  <Download className="mr-2 h-4 w-4" />
                  {language === "uz" ? "Eksport" : "Export"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onExportPdf}>
                  {language === "uz" ? "PDF yuklab olish" : "Export PDF"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
