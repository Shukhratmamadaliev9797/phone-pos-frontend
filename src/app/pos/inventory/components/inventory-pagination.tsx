import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export function InventoryPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number; // 1-based
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const { language } = useI18n();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ✅ 1 page bo'lsa ko'rsatmaymiz
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-muted-foreground">
        {language === "uz" ? "Ko'rsatilmoqda" : "Showing"}{" "}
        <span className="font-medium text-foreground">{start}</span>–
        <span className="font-medium text-foreground">{end}</span>{" "}
        {language === "uz" ? "dan" : "of"}{" "}
        <span className="font-medium text-foreground">{total}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-2xl"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {language === "uz" ? "Oldingi" : "Prev"}
        </Button>

        <div className="min-w-[80px] text-center text-xs text-muted-foreground">
          {language === "uz" ? "Sahifa" : "Page"}{" "}
          <span className="font-medium text-foreground">{page}</span> /{" "}
          <span className="font-medium text-foreground">{totalPages}</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="rounded-2xl"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          {language === "uz" ? "Keyingi" : "Next"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
