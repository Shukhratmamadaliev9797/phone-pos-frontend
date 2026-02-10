
import { useI18n } from "@/lib/i18n/provider";

export function CustomersPageHeader() {
  const { language } = useI18n();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {language === "uz" ? "Mijozlar" : "Customers"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {language === "uz"
            ? "Qarz/Kredit balansi va tarixi"
            : "Debt/Credit balances and history"}
        </p>
      </div>

      
    </div>
  );
}
