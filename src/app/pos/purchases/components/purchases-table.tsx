import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PurchaseListItem } from '@/lib/api/purchases'
import { useI18n } from '@/lib/i18n/provider'

function money(n: string | number) {
  const value = typeof n === 'number' ? n : Number(n)
  return `${value.toLocaleString('en-US')} so'm`
}

function PaymentTypeBadge({ type }: { type: 'PAID_NOW' | 'PAY_LATER' }) {
  const isLater = type === 'PAY_LATER'
  return (
    <Badge
      variant="secondary"
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        isLater
          ? 'bg-amber-500/10 text-amber-800 border-amber-200'
          : 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      )}
    >
      {isLater ? 'Pay later' : 'Full payment'}
    </Badge>
  )
}

function PhoneStatusBadge({
  status,
}: {
  status: PurchaseListItem['phoneStatus']
}) {
  const safeStatus = status ?? 'IN_STOCK'
  const isSold = safeStatus === 'SOLD'
  const isRepair = safeStatus === 'IN_REPAIR'
  const isReady = safeStatus === 'READY_FOR_SALE'
  return (
    <Badge
      variant="secondary"
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        isSold
          ? 'bg-rose-500/10 text-rose-700 border-rose-200'
          : isRepair
            ? 'bg-amber-500/10 text-amber-800 border-amber-200'
            : isReady
              ? 'bg-sky-500/10 text-sky-700 border-sky-200'
              : 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      )}
    >
      {isSold ? 'Sold' : isRepair ? 'In repair' : isReady ? 'Ready for sale' : 'In stock'}
    </Badge>
  )
}

export function PurchasesTable({
  rows,
  loading,
  error,
  page,
  totalPages,
  total,
  canManage,
  canDelete,
  onPageChange,
  onView,
  onEdit,
  onMoveToRepair,
  onDelete,
}: {
  rows: PurchaseListItem[]
  loading: boolean
  error: string | null
  page: number
  totalPages: number
  total: number
  canManage: boolean
  canDelete: boolean
  onPageChange: (nextPage: number) => void
  onView: (row: PurchaseListItem) => void
  onEdit: (row: PurchaseListItem) => void
  onMoveToRepair: (row: PurchaseListItem) => void
  onDelete: (row: PurchaseListItem) => void
}) {
  const { language } = useI18n()
  const shown = rows.length
  const pageNumbers = Array.from(
    { length: Math.max(totalPages, 1) },
    (_, index) => index + 1,
  )

  return (
    <div className="rounded-3xl border border-muted/40 bg-muted/30 p-2">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[170px]">Date</TableHead>
              <TableHead className="min-w-[220px]">Phone</TableHead>
              <TableHead className="min-w-[220px]">Customer</TableHead>
              <TableHead>Status</TableHead>

              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead>Payment type</TableHead>
              <TableHead className="w-[60px] text-right"> </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => onView(row)}>
                <TableCell className="text-sm">
                  {new Date(row.purchasedAt).toLocaleDateString()}
                </TableCell>

                <TableCell>
                  <div className="leading-tight">
                    <div className="text-sm font-medium">
                      {row.phoneLabel ?? '—'}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="leading-tight">
                    <div className="text-sm font-medium">
                      {row.customer?.fullName ??
                        (row.customerId ? `Customer #${row.customerId}` : '—')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {row.customer?.phoneNumber ?? ''}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <PhoneStatusBadge status={row.phoneStatus} />
                </TableCell>

                <TableCell className="text-right">{money(row.totalPrice)}</TableCell>
                <TableCell className="text-right">{money(row.paidNow)}</TableCell>
                <TableCell className="text-right">{money(row.remaining)}</TableCell>

                <TableCell>
                  <PaymentTypeBadge type={row.paymentType} />
                </TableCell>

                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onClick={() => onView(row)}>View details</DropdownMenuItem>

                      {canManage ? (
                        <>
                          <DropdownMenuItem onClick={() => onEdit(row)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onMoveToRepair(row)}>
                            In repair
                          </DropdownMenuItem>
                        </>
                      ) : null}

                      {canDelete ? (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600"
                            onClick={() => onDelete(row)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  {error ?? 'No purchases found'}
                </TableCell>
              </TableRow>
            ) : null}

            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  Loading purchases...
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-muted/40 bg-background/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            {language === 'uz' ? "Ko'rsatilgan" : 'Showing'}{' '}
            <span className="font-medium text-foreground">{shown}</span> /{' '}
            <span className="font-medium text-foreground">{total}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl px-3"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
            >
              {language === 'uz' ? 'Oldingi' : 'Prev'}
            </Button>

            <div className="hidden items-center gap-1 sm:flex">
              {pageNumbers.map((pageNumber) => (
                <Button
                  key={pageNumber}
                  type="button"
                  variant={pageNumber === page ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 min-w-8 rounded-xl px-2"
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-xl px-3"
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            >
              {language === 'uz' ? 'Keyingi' : 'Next'}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
