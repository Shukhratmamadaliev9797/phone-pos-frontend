// src/components/pos/help/help-search.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

type HelpSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function HelpSearch({ value, onChange }: HelpSearchProps) {
  const { language } = useI18n();

  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-10 rounded-2xl pl-9"
              placeholder={
                language === "uz"
                  ? "Yordamdan qidiring: xarid, sotuv, qarz/kredit, ta'mir, to'lov..."
                  : "Search help: purchase, sale, debt/credit, repair, payments..."
              }
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          {language === "uz"
            ? "Maslahat: kalit so'zlar bilan qidiring, masalan "
            : "Tip: You can search by keywords like "}
          <span className="font-medium">“pay later”</span>,{" "}
          <span className="font-medium">“IMEI”</span>,{" "}
          {language === "uz" ? "yoki" : "or"}{" "}
          <span className="font-medium">“void”</span>.
        </div>
      </CardContent>
    </Card>
  );
}
