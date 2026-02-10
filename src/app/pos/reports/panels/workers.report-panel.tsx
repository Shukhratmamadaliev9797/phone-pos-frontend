import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { ReportsOverview } from "@/lib/api/reports";
import { useI18n } from "@/lib/i18n/provider";

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

export function WorkersReportPanel({ data }: { data: ReportsOverview }) {
  const { language } = useI18n();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <MiniCard label={language === "uz" ? "Xodimlar soni" : "Workers count"} value={String(data.workersCount)} />
        <MiniCard label={language === "uz" ? "Jami to'langan ish haqi" : "Total salary paid"} value={money(data.workersTotalSalaryPaid)} />
        <MiniCard label={language === "uz" ? "Kutilayotgan to'lovlar" : "Pending payments"} value={money(data.workersPendingPayments)} />
      </div>

      <Card className="rounded-3xl overflow-hidden border-muted/40 bg-muted/30">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="text-sm font-semibold">
              {language === "uz" ? "Xodim to'lovlari" : "Worker payments"}
            </div>
            <div className="text-sm text-muted-foreground">
              {language === "uz" ? "Oylik ish haqi kuzatuvi" : "Monthly salary tracking"}
            </div>
          </div>
          <Separator />

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "uz" ? "Oy" : "Month"}</TableHead>
                  <TableHead>{language === "uz" ? "Xodim" : "Worker"}</TableHead>
                  <TableHead className="text-right">{language === "uz" ? "Ish haqi" : "Salary"}</TableHead>
                  <TableHead className="text-right">{language === "uz" ? "To'langan" : "Paid"}</TableHead>
                  <TableHead>{language === "uz" ? "Oxirgi to'lov" : "Last paid"}</TableHead>
                  <TableHead className="w-[90px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.workerPayments.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="whitespace-nowrap">{r.month}</TableCell>
                    <TableCell className="whitespace-nowrap font-medium">{r.worker}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{money(r.salary)}</TableCell>
                    <TableCell className="text-right whitespace-nowrap">{money(r.paid)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{r.lastPaid}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="rounded-2xl">
                        <Eye className="mr-2 h-4 w-4" />
                        {language === "uz" ? "Ko'rish" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data.workerPayments.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={6} className="text-muted-foreground">
                        {language === "uz" ? "Xodim to'lovlari yo'q" : "No worker payment rows"}
                      </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="pr-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-2 text-lg font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
