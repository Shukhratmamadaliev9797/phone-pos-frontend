
import { useI18n } from "@/lib/i18n/provider";

type DashboardHeadingProps = {
  title?: string;
  subtitle?: string;
};

export function DashboardHeading({
  title,
  subtitle,
}: DashboardHeadingProps) {
  const { language } = useI18n();
  const resolvedTitle = title ?? (language === "uz" ? "Boshqaruv paneli" : "Dashboard");
  const resolvedSubtitle =
    subtitle ??
    (language === "uz"
      ? "Sotuv, foyda, xarajatlar va mijoz balanslari bo'yicha umumiy ko'rinish."
      : "Overview of sales, profit, spending, and customer balances.");

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-xl font-semibold tracking-tight">
        {resolvedTitle}
      </h1>
      <p className="text-sm text-muted-foreground">
        {resolvedSubtitle}
      </p>
    </div>
  );
}
