import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DashboardOverview } from "@/lib/api/dashboard";
import { useI18n } from "@/lib/i18n/provider";

type Row = {
  phone: string;
  amount: number;
  status: "Paid" | "Debt";
};

function money(value: number) {
  return `${Math.round(value).toLocaleString("en-US")} so'm`;
}

function StatusBadge({ status }: { status: Row["status"] }) {
  const { language } = useI18n();
  const isPaid = status === "Paid";
  const label =
    status === "Paid"
      ? language === "uz"
        ? "To'langan"
        : "Paid"
      : language === "uz"
        ? "Qarz"
        : "Debt";
  return (
    <Badge
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        isPaid
          ? "bg-emerald-500/10 text-emerald-700 border-emerald-200"
          : "bg-rose-500/10 text-rose-700 border-rose-200"
      )}
      variant="secondary"
    >
      {label}
    </Badge>
  );
}

export function RecentSalesCard({
  rows,
}: {
  rows: DashboardOverview["recentSales"];
}) {
  const { language } = useI18n();
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">
            {language === "uz" ? "So'nggi sotuvlar" : "Recent Sales"}
          </CardTitle>
          <CardDescription className="text-xs">
            {language === "uz" ? "Oxirgi 10 ta telefon sotuvi" : "Last 10 phone sales"}
          </CardDescription>
        </div>

        <Link
          to="/sales"
          className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-4"
        >
          {language === "uz" ? "Barchasini ko'rish" : "View all"}
        </Link>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === "uz" ? "Telefon" : "Phone"}</TableHead>
              <TableHead className="text-right">{language === "uz" ? "Summa" : "Amount"}</TableHead>
              <TableHead className="text-right">{language === "uz" ? "Holat" : "Status"}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={row.phone + i}>
                <TableCell className="font-medium">{row.phone}</TableCell>
                <TableCell className="text-right">{money(row.amount)}</TableCell>
                <TableCell className="text-right">
                  <StatusBadge status={row.status as Row["status"]} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell className="text-muted-foreground" colSpan={3}>
                  {language === "uz" ? "So'nggi sotuvlar yo'q" : "No recent sales"}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
