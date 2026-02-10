// src/components/pos/help/help-guides.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { HelpGuideRecord, HelpRole } from "./help-data";
import { useI18n } from "@/lib/i18n/provider";

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-2 text-sm">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2">
          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-muted/10 text-xs">
            {i + 1}
          </span>
          <span className="text-muted-foreground">{s}</span>
        </li>
      ))}
    </ol>
  );
}

type HelpGuidesProps = {
  role: HelpRole;
  guides: HelpGuideRecord[];
};

export function HelpGuides({ role, guides }: HelpGuidesProps) {
  const { language } = useI18n();
  if (guides.length === 0) {
    return (
      <Card className="rounded-3xl border-muted/40 bg-muted/30" id="guides">
        <CardContent className="p-4 sm:p-6">
          <div className="text-sm text-muted-foreground">
            {language === "uz"
              ? "Bu qidiruv bo'yicha mos qo'llanma topilmadi."
              : "No matching guides found for this search."}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30" id="guides">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">
              {language === "uz" ? "Qo'llanmalar" : "Guides"}
            </div>
            <div className="text-sm text-muted-foreground">
              {language === "uz"
                ? "Joriy akkaunt roli uchun ish oqimlari."
                : "Role-based workflows for your current account."}
            </div>
          </div>
          <Badge className="rounded-full">{role}</Badge>
        </div>

        <Separator className="my-4" />

        <Accordion type="single" collapsible className="w-full">
          {guides.map((guide) => (
            <AccordionItem key={guide.id} value={guide.id} id={`guide-${guide.id}`}>
              <AccordionTrigger>{guide.title}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">{guide.summary}</div>
                  <Steps items={guide.steps} />
                  <div className="rounded-2xl border bg-muted/10 p-3 text-xs text-muted-foreground">
                    {language === "uz" ? "Modul" : "Module"}:{" "}
                    <span className="font-medium">{guide.module}</span> •{" "}
                    {language === "uz" ? "Yo'l" : "Path"}:{" "}
                    <span className="font-medium">{guide.path}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
