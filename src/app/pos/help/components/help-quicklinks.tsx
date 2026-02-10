// src/components/pos/help/help-quick-links.tsx
import { Card, CardContent } from "@/components/ui/card";
import {
  Wrench,
  ShoppingCart,
  HandCoins,
  Receipt,
  BarChart3,
  Users,
  Settings,
  Boxes,
} from "lucide-react";
import type { HelpGuideRecord } from "./help-data";
import { useI18n } from "@/lib/i18n/provider";

const ICON_BY_GUIDE_ID = {
  purchase: ShoppingCart,
  sale: Receipt,
  repair: Wrench,
  customers: HandCoins,
  inventory: Boxes,
  reports: BarChart3,
  workers: Users,
  settings: Settings,
} as const;

type HelpQuickLinksProps = {
  guides: HelpGuideRecord[];
};

export function HelpQuickLinks({ guides }: HelpQuickLinksProps) {
  const { language } = useI18n();
  if (guides.length === 0) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="p-4 text-sm text-muted-foreground">
          {language === "uz"
            ? "Qidiruv va rol bo'yicha yordam bo'limlari topilmadi."
            : "No help items found for this search and role."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {guides.map((guide) => {
        const Icon = ICON_BY_GUIDE_ID[guide.id as keyof typeof ICON_BY_GUIDE_ID] ?? Users;
        return (
        <a key={guide.id} href={`#guide-${guide.id}`} className="group">
          <Card className="rounded-3xl transition hover:bg-muted/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl border bg-muted/10 p-2">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold group-hover:underline">
                    {guide.title}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {guide.summary}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </a>
      )})}
    </div>
  );
}
