import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { ReportsOverview } from "@/lib/api/reports";
import { useI18n } from "@/lib/i18n/provider";

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

function pill(kind: "DEBT" | "CREDIT") {
  return kind === "DEBT"
    ? "bg-rose-500/15 text-rose-700 hover:bg-rose-500/15"
    : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15";
}

export function CustomersReportPanel({ data }: { data: ReportsOverview }) {
  const { language } = useI18n();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="text-sm font-semibold">
              {language === "uz" ? "Eng katta qarzdor mijozlar" : "Top debt customers"}
            </div>
            <div className="text-sm text-muted-foreground">
              {language === "uz" ? "Eng katta to'lanmagan sotuvlar (qarz)" : "Highest unpaid sales (debt)"}
            </div>
          </div>
          <Separator />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "uz" ? "Mijoz" : "Customer"}</TableHead>
                  <TableHead className="text-right">{language === "uz" ? "Qarz" : "Debt"}</TableHead>
                  <TableHead>{language === "uz" ? "Oxirgi faoliyat" : "Last activity"}</TableHead>
                  <TableHead className="w-[90px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.debtCustomers.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge className={cn("rounded-full", pill("DEBT"))}>{money(c.amount)}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{c.last}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="rounded-2xl">
                        <Eye className="mr-2 h-4 w-4" />
                        {language === "uz" ? "Ko'rish" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data.debtCustomers.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        {language === "uz" ? "Qarzdor mijozlar yo'q" : "No debt customers"}
                      </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="text-sm font-semibold">
              {language === "uz" ? "Eng katta kreditli mijozlar" : "Top credit customers"}
            </div>
            <div className="text-sm text-muted-foreground">
              {language === "uz" ? "Eng katta to'lanmagan xaridlar (kredit)" : "Highest unpaid purchases (credit)"}
            </div>
          </div>
          <Separator />
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === "uz" ? "Mijoz" : "Customer"}</TableHead>
                  <TableHead className="text-right">{language === "uz" ? "Kredit" : "Credit"}</TableHead>
                  <TableHead>{language === "uz" ? "Oxirgi faoliyat" : "Last activity"}</TableHead>
                  <TableHead className="w-[90px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.creditCustomers.map((c, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Badge className={cn("rounded-full", pill("CREDIT"))}>{money(c.amount)}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{c.last}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="rounded-2xl">
                        <Eye className="mr-2 h-4 w-4" />
                        {language === "uz" ? "Ko'rish" : "View"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data.creditCustomers.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground">
                        {language === "uz" ? "Kreditli mijozlar yo'q" : "No credit customers"}
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
