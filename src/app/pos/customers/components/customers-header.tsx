import { Separator } from "@/components/ui/separator";
import { Users } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function CustomersPageHeader() {
  const { language } = useI18n();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight">
            {language === "uz" ? "Mijozlar" : "Customers"}
          </h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {language === "uz"
            ? "Qarz/Kredit balansi va tarixi"
            : "Debt/Credit balances and history"}
        </p>
      </div>
      <Separator />
    </div>
  );
}
