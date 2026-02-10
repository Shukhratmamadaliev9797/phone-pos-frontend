import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { AddSalaryPaymentPayload } from '@/lib/api/workers'
import type { WorkerRow } from '../components/workers-table'
import { useI18n } from '@/lib/i18n/provider'

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString('en-US')} so'm`
}

export function PaySalaryModal({
  open,
  onOpenChange,
  worker,
  month,
  canManage,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  worker: WorkerRow | null
  month: string
  canManage: boolean
  onSubmit: (workerId: number, payload: AddSalaryPaymentPayload) => Promise<void>
}) {
  const { language } = useI18n()
  const [amount, setAmount] = React.useState<string>('')
  const [paidAt, setPaidAt] = React.useState<string>('')
  const [notes, setNotes] = React.useState<string>('')
  const [error, setError] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setAmount('')
      setPaidAt('')
      setNotes('')
      setError(null)
      setSaving(false)
    }
  }, [open])

  async function handleSave() {
    if (!canManage) {
      setError(language === 'uz' ? "Ruxsat yo'q" : 'Not allowed')
      return
    }

    if (!worker) {
      setError(language === 'uz' ? 'Xodim tanlanmagan' : 'Worker not selected')
      return
    }

    const amountPaid = Number(amount)
    if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
      setError(language === 'uz' ? "Summa 0 dan katta bo'lishi kerak" : 'Amount must be greater than 0')
      return
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      setError(language === 'uz' ? "Oy YYYY-MM formatida bo'lishi kerak" : 'Month must be in YYYY-MM format')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await onSubmit(worker.id, {
        month,
        amountPaid,
        paidAt: paidAt ? new Date(paidAt).toISOString() : undefined,
        notes: notes.trim() || undefined,
      })
      onOpenChange(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === 'uz'
            ? "To'lovni saqlab bo'lmadi"
            : 'Failed to save payment',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[min(94vw,32rem)] p-0 overflow-hidden rounded-3xl">
        <div className="flex flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {language === 'uz' ? "Ish haqi to'lash" : 'Pay salary'}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {worker
                      ? `${worker.fullName} • ${month}`
                      : `${language === 'uz' ? 'Xodimni tanlang' : 'Select worker'} • ${month}`}
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            {worker ? (
              <div className="rounded-3xl border p-4 text-sm">
                <div className="font-medium">{worker.fullName}</div>
                <div className="text-muted-foreground">{worker.role}</div>
                <div className="mt-2 text-muted-foreground">
                  {language === 'uz' ? 'Ish haqi' : 'Salary'}: {money(worker.monthlySalary)} •{' '}
                  {language === 'uz' ? 'Qolgan' : 'Remaining'}: {money(worker.monthRemaining)}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>{language === 'uz' ? 'Oy' : 'Month'}</Label>
              <Input value={month} readOnly className="h-10 rounded-2xl" />
            </div>

            <div className="space-y-2">
              <Label>{language === 'uz' ? "To'langan summa" : 'Amount paid'}</Label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                placeholder={language === 'uz' ? 'masalan: 1500000' : 'e.g. 1500000'}
                className="h-10 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'uz' ? "To'langan sana (ixtiyoriy)" : 'Paid at (optional)'}</Label>
              <Input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                className="h-10 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'uz' ? 'Izohlar' : 'Notes'}</Label>
              <Textarea
                placeholder={language === 'uz' ? 'Ixtiyoriy izohlar...' : 'Optional notes...'}
                className="rounded-2xl"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="border-t p-4">
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
                {language === 'uz' ? 'Bekor qilish' : 'Cancel'}
              </Button>
              <Button className="rounded-2xl" onClick={handleSave} disabled={saving || !canManage}>
                {saving
                  ? language === 'uz'
                    ? 'Saqlanmoqda...'
                    : 'Saving...'
                  : language === 'uz'
                    ? 'Saqlash'
                    : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
