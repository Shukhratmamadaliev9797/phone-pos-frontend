import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreVertical,
  Eye,
  Pencil,
  CornerUpLeft,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";

export type RepairStatus = "PENDING" | "DONE";

export type RepairRow = {
  id: string;
  dateTime: string;
  itemName: string;
  imei?: string;
  technician?: string;
  status: RepairStatus;
  totalCost: number;
  partsCost?: number;
  laborCost?: number;
  notes?: string;
};

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString("en-US")} so'm`;
}

function statusPill(status: RepairStatus) {
  return status === "DONE"
    ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15"
    : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/15";
}

export function RepairsTable({
  rows,
  loading,
  error,
  canManage,
  onRowClick,
  onViewDetails,
  onEdit,
  onMarkReady,
}: {
  rows: RepairRow[];
  loading?: boolean;
  error?: string | null;
  canManage?: boolean;
  onRowClick?: (row: RepairRow) => void;
  onViewDetails?: (row: RepairRow) => void;
  onEdit?: (row: RepairRow) => void;
  onMarkReady?: (row: RepairRow) => void;
}) {
  const { language } = useI18n();

  return (
    <Card className="rounded-3xl overflow-hidden border-muted/40 bg-muted/30">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  {language === "uz" ? "Sana/Vaqt" : "Date/Time"}
                </TableHead>
                <TableHead>{language === "uz" ? "Telefon" : "Phone"}</TableHead>
                <TableHead className="whitespace-nowrap">IMEI/Serial</TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  {language === "uz" ? "Narx" : "Cost"}
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  {language === "uz" ? "Holat" : "Status"}
                </TableHead>
                <TableHead>{language === "uz" ? "Izohlar" : "Notes"}</TableHead>
                <TableHead className="w-[64px]" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((r) => {
                return (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => onRowClick?.(r)}
                  >
                    <TableCell className="whitespace-nowrap text-sm">
                      {r.dateTime}
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-medium">{r.itemName || "—"}</div>
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      {r.imei ? (
                        <span className="text-sm">{r.imei}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <div className="text-sm font-medium">
                        {money(r.totalCost)}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={cn("rounded-full", statusPill(r.status))}
                      >
                        {r.status === "DONE"
                          ? language === "uz"
                            ? "Bajarilgan"
                            : "Done"
                          : language === "uz"
                            ? "Kutilmoqda"
                            : "Pending"}
                      </Badge>
                    </TableCell>

                    <TableCell className="max-w-[360px]">
                      <div className="truncate text-sm text-muted-foreground">
                        {r.notes?.trim() ? r.notes : "—"}
                      </div>
                    </TableCell>

                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-2xl"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem onClick={() => onViewDetails?.(r)}>
                            <Eye className="mr-2 h-4 w-4" />
                            {language === "uz"
                              ? "Batafsil ko'rish"
                              : "View details"}
                          </DropdownMenuItem>

                          {canManage ? (
                            <>
                              <DropdownMenuItem onClick={() => onEdit?.(r)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                {language === "uz" ? "Tahrirlash" : "Edit"}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem
                                onClick={() => onMarkReady?.(r)}
                                disabled={r.status === "DONE"}
                              >
                                <CornerUpLeft className="mr-2 h-4 w-4" />
                                {language === "uz"
                                  ? "Sotuvga tayyor"
                                  : "Ready for sale"}
                              </DropdownMenuItem>
                            </>
                          ) : null}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}

              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {language === "uz"
                      ? "Ta'mirlar yuklanmoqda..."
                      : "Loading repairs..."}
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && error ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-rose-600"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : null}

              {!loading && !error && rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {language === "uz"
                      ? "Ta'mirlar topilmadi."
                      : "No repairs found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
