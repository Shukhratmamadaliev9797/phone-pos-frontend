import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { HelpGuideRecord } from "./help-data";
import { useI18n } from "@/lib/i18n/provider";

type HelpRoleTableProps = {
  guides: HelpGuideRecord[];
};

export function HelpRoleTable({ guides }: HelpRoleTableProps) {
  const { language } = useI18n();
  if (guides.length === 0) {
    return (
      <Card className="rounded-3xl">
        <CardContent className="p-4 text-sm text-muted-foreground">
          {language === "uz"
            ? "Joriy qidiruv uchun mos amallar topilmadi."
            : "No operations available for current search."}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl">
      <CardContent className="p-4 sm:p-6">
        <div>
          <div className="text-sm font-semibold">
            {language === "uz" ? "Rol bo'yicha amallar jadvali" : "Role-based Operations Table"}
          </div>
          <div className="text-sm text-muted-foreground">
            {language === "uz"
              ? "Quyida faqat sizning rolingizga ruxsat etilgan amallar ko'rsatiladi."
              : "Only actions available for your role are shown below."}
          </div>
        </div>

        <Separator className="my-4" />

        <div className="overflow-x-auto rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[130px]">{language === "uz" ? "Modul" : "Module"}</TableHead>
                <TableHead className="min-w-[190px]">{language === "uz" ? "Amal" : "Action"}</TableHead>
                <TableHead className="min-w-[260px]">{language === "uz" ? "Foydalanish" : "Usage"}</TableHead>
                <TableHead className="min-w-[120px]">{language === "uz" ? "Yo'l" : "Path"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guides.map((guide) => (
                <TableRow key={guide.id}>
                  <TableCell className="font-medium">{guide.module}</TableCell>
                  <TableCell>{guide.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {guide.steps[0] ?? guide.summary}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{guide.path}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
