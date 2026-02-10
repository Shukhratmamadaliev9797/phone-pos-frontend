import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  Package,
  Plus,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

interface InventoryPageHeaderProps {
  title?: string;
  description?: string;
  canManage?: boolean;
  onAddPhone?: () => void;
}

export function InventoryPageHeader({
  title,
  description,
  canManage = false,
  onAddPhone,
}: InventoryPageHeaderProps) {
  const { language } = useI18n();
  const resolvedTitle = title ?? (language === "uz" ? "Inventar" : "Inventory");
  const resolvedDescription =
    description ??
    (language === "uz"
      ? "Ombordagi, ta'mirdagi va sotuvga tayyor telefonlarni boshqaring"
      : "Manage phones in stock, repair and sale ready items");

  return (
    <div className="space-y-4">
      {/* Top row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              {resolvedTitle}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {resolvedDescription}
          </p>
        </div>

      
        {canManage ? (
          <Button className="rounded-2xl" onClick={onAddPhone}>
            <Plus className="mr-2 h-4 w-4" />
            {language === "uz" ? "Telefon qo'shish" : "Add phone"}
          </Button>
        ) : null}
      </div>

      <Separator />
    </div>
  );
}
