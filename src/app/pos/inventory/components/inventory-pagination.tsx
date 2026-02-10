import { Button } from "@/components/ui/button";
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
  const shown = Math.min(pageSize, Math.max(total - (page - 1) * pageSize, 0));
  const pageNumbers = Array.from(
    { length: Math.max(totalPages, 1) },
    (_, index) => index + 1,
  );

  return (
    <div className="rounded-2xl border border-muted/40 bg-background/50 px-3 py-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-muted-foreground">
        {language === "uz" ? "Ko'rsatilgan" : "Showing"}{" "}
        <span className="font-medium text-foreground">{shown}</span> /{" "}
        <span className="font-medium text-foreground">{total}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-xl px-3"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        >
          {language === "uz" ? "Oldingi" : "Prev"}
        </Button>

        <div className="hidden items-center gap-1 sm:flex">
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              type="button"
              variant={pageNumber === page ? "default" : "outline"}
              size="sm"
              className="h-8 min-w-8 rounded-xl px-2"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-xl px-3"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          {language === "uz" ? "Keyingi" : "Next"}
        </Button>
      </div>
      </div>
    </div>
  );
}
