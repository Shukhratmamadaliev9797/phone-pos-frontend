import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Eye, EyeOff, Pencil, Wallet } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SalaryPaymentView, WorkerDetailsView } from '@/lib/api/workers'
import type { WorkerRow } from '../components/workers-table'
import { useI18n } from '@/lib/i18n/provider'

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString('en-US')} so'm`
}

function statusPill(s: 'PAID' | 'PARTIAL' | 'UNPAID') {
  if (s === 'PAID') return 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15'
  if (s === 'PARTIAL') return 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/15'
  return 'bg-rose-500/15 text-rose-700 hover:bg-rose-500/15'
}

export function WorkerDetailsModal({
  open,
  onOpenChange,
  worker,
  details,
  payments,
  month,
  canManage,
  loading,
  onPay,
  onEdit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  worker: WorkerRow | null
  details: WorkerDetailsView | null
  payments: SalaryPaymentView[]
  month: string
  canManage: boolean
  loading: boolean
  onPay?: () => void
  onEdit?: () => void
}) {
  const { language } = useI18n()
  const [showPasswordHint, setShowPasswordHint] = React.useState(false)

  if (!worker) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[min(94vw,56rem)] h-[85vh] p-0 overflow-hidden rounded-3xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {language === 'uz' ? "Xodim ma'lumotlari" : 'Worker details'}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {worker.fullName} • {worker.role} • {language === 'uz' ? 'Oy' : 'Month'} {month}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="rounded-3xl border p-4 text-sm text-muted-foreground">
                {language === 'uz' ? "Xodim ma'lumotlari yuklanmoqda..." : 'Loading worker details...'}
              </div>
            ) : null}

            {!loading ? (
              <div className="rounded-3xl border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold">{worker.fullName}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {details?.phoneNumber ?? worker.phoneNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {details?.address ?? (language === 'uz' ? "Manzil yo'q" : 'No address')}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge className={cn('rounded-full', statusPill(worker.status))}>
                        {worker.status === 'PAID'
                          ? language === 'uz'
                            ? "To'langan"
                            : 'Paid'
                          : worker.status === 'PARTIAL'
                            ? language === 'uz'
                              ? 'Qisman'
                              : 'Partial'
                            : language === 'uz'
                              ? "To'lanmagan"
                              : 'Unpaid'}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        {language === 'uz' ? 'Ish haqi' : 'Salary'}: {money(worker.monthlySalary)}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        {language === 'uz' ? "To'langan" : 'Paid'}: {money(worker.monthPaid)}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        {language === 'uz' ? 'Qolgan' : 'Remaining'}: {money(worker.monthRemaining)}
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        {language === 'uz' ? 'Ruxsat' : 'Access'}:{' '}
                        {details?.hasDashboardAccess
                          ? language === 'uz'
                            ? 'Ha'
                            : 'Yes'
                          : language === 'uz'
                            ? "Yo'q"
                            : 'No'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {canManage ? (
                      <>
                        <Button variant="outline" className="rounded-2xl" onClick={onEdit}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {language === 'uz' ? 'Tahrirlash' : 'Edit'}
                        </Button>
                        <Button className="rounded-2xl" onClick={onPay}>
                          <Wallet className="mr-2 h-4 w-4" />
                          {language === 'uz' ? "Ish haqi to'lash" : 'Pay salary'}
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            {!loading && details?.hasDashboardAccess ? (
              <div className="rounded-3xl border p-4 space-y-3">
                <div>
                  <div className="text-sm font-semibold">
                    {language === 'uz' ? "Dashboard login ma'lumotlari" : 'Dashboard Login Details'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'uz'
                      ? "Parollar shifrlangan va to'g'ridan-to'g'ri ko'rib bo'lmaydi."
                      : 'Passwords are encrypted and cannot be read directly.'}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'uz' ? 'Email / Username' : 'Email / Username'}
                    </p>
                    <p className="text-sm font-medium break-all">{details.loginEmail ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{language === 'uz' ? 'Parol' : 'Password'}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {showPasswordHint
                          ? language === 'uz'
                            ? "Shifrlangan (ko'rib bo'lmaydi)"
                            : 'Encrypted (not viewable)'
                          : '••••••••'}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-xl"
                        onClick={() => setShowPasswordHint((prev) => !prev)}
                      >
                        {showPasswordHint ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <Separator />

            <div className="rounded-3xl border overflow-hidden">
              <div className="border-b p-4">
                <div className="text-sm font-semibold">
                  {language === 'uz' ? "To'lov tarixi" : 'Payment history'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === 'uz' ? "Ish haqi to'lov yozuvlari" : 'Salary payment records'}
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{language === 'uz' ? 'Oy' : 'Month'}</TableHead>
                      <TableHead className="text-right">{language === 'uz' ? 'Summa' : 'Amount'}</TableHead>
                      <TableHead>{language === 'uz' ? 'Sana' : 'Date'}</TableHead>
                      <TableHead>{language === 'uz' ? 'Izohlar' : 'Notes'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="whitespace-nowrap">{payment.month}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {money(Number(payment.amountPaid))}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {new Date(payment.paidAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{payment.notes ?? '—'}</TableCell>
                      </TableRow>
                    ))}

                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                          {language === 'uz' ? "Ish haqi to'lov tarixi yo'q" : 'No salary payment history'}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex justify-end">
              <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
                {language === 'uz' ? 'Yopish' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
