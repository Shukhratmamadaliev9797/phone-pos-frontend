import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Circle } from "lucide-react";
import {
  listSupportRequests,
  type SupportRequestView,
  updateSupportRequestStatus,
} from "@/lib/api/support-requests";

const PAGE_SIZE = 10;

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function MessagesPage() {
  const [rows, setRows] = React.useState<SupportRequestView[]>([]);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"all" | "read" | "unread">("all");
  const [selected, setSelected] = React.useState<SupportRequestView | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [statusSaving, setStatusSaving] = React.useState(false);

  const loadRows = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listSupportRequests({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        status,
      });
      setRows(response.data);
      setTotalPages(response.meta.totalPages || 1);
    } catch (requestError) {
      setRows([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load messages.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  React.useEffect(() => {
    void loadRows();
  }, [loadRows]);

  React.useEffect(() => {
    setPage(1);
  }, [search]);

  React.useEffect(() => {
    setPage(1);
  }, [status]);

  async function handleToggleRead(nextIsRead: boolean) {
    if (!selected) return;
    try {
      setStatusSaving(true);
      const updated = await updateSupportRequestStatus(selected.id, nextIsRead);
      setSelected(updated);
      setRows((prev) => {
        const mapped = prev.map((row) => (row.id === updated.id ? updated : row));
        if (status === "unread" && updated.isRead) {
          return mapped.filter((row) => row.id !== updated.id);
        }
        if (status === "read" && !updated.isRead) {
          return mapped.filter((row) => row.id !== updated.id);
        }
        return mapped;
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to update message status.",
      );
    } finally {
      setStatusSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Help Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Requests submitted from Help page.
        </p>
      </div>

      <Card className="rounded-3xl">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="max-w-md">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by full name or message..."
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={status === "all" ? "default" : "outline"}
              onClick={() => setStatus("all")}
            >
              All
            </Button>
            <Button
              variant={status === "unread" ? "default" : "outline"}
              onClick={() => setStatus("unread")}
            >
              Unread
            </Button>
            <Button
              variant={status === "read" ? "default" : "outline"}
              onClick={() => setStatus("read")}
            >
              Read
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Sender</TableHead>
                  <TableHead className="min-w-[130px]">Role</TableHead>
                  <TableHead className="min-w-[100px]">Status</TableHead>
                  <TableHead className="min-w-[360px]">Message</TableHead>
                  <TableHead className="min-w-[180px]">Created at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      Loading messages...
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading && error ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-rose-600">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading && !error && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      No messages found.
                    </TableCell>
                  </TableRow>
                ) : null}

                {!loading && !error
                  ? rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelected(row);
                          setModalOpen(true);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {!row.isRead ? (
                              <Circle className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                            ) : null}
                            <span>{row.senderFullName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{row.senderRole}</TableCell>
                        <TableCell>
                          <Badge
                            variant={row.isRead ? "secondary" : "default"}
                            className="rounded-full"
                          >
                            {row.isRead ? "Read" : "Unread"}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-pre-wrap break-words">
                          {row.message}
                        </TableCell>
                        <TableCell>{formatDate(row.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  : null}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
            >
              Prev
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} / {Math.max(1, totalPages)}
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>Message details</DialogTitle>
          </DialogHeader>

          {!selected ? (
            <div className="text-sm text-muted-foreground">No message selected.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border p-3">
                  <div className="text-xs text-muted-foreground">Full name</div>
                  <div className="text-sm font-medium">{selected.senderFullName}</div>
                </div>
                <div className="rounded-2xl border p-3">
                  <div className="text-xs text-muted-foreground">Role</div>
                  <div className="text-sm font-medium">{selected.senderRole}</div>
                </div>
                <div className="rounded-2xl border p-3">
                  <div className="text-xs text-muted-foreground">Status</div>
                  <div className="text-sm font-medium">
                    {selected.isRead ? "Read" : "Unread"}
                  </div>
                </div>
                <div className="rounded-2xl border p-3">
                  <div className="text-xs text-muted-foreground">Created at</div>
                  <div className="text-sm font-medium">{formatDate(selected.createdAt)}</div>
                </div>
              </div>

              <div className="rounded-2xl border p-3">
                <div className="text-xs text-muted-foreground">Message</div>
                <div className="mt-1 whitespace-pre-wrap break-words text-sm">
                  {selected.message}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  disabled={statusSaving}
                >
                  Close
                </Button>
                <Button
                  onClick={() => void handleToggleRead(!selected.isRead)}
                  disabled={statusSaving}
                >
                  {statusSaving
                    ? "Saving..."
                    : selected.isRead
                    ? "Mark as unread"
                    : "Mark as read"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
