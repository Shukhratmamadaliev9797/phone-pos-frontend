import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  HandCoins,
  CircleDollarSign,
  CreditCard,
  ReceiptText,
  Banknote,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PurchaseDetail } from '@/lib/api/purchases'
import { useI18n } from '@/lib/i18n/provider'

function money(n: string | number) {
  const value = typeof n === 'number' ? n : Number(n)
  return `${value.toLocaleString('en-US')} so'm`
}

function methodLabel(method: PurchaseDetail['paymentMethod'], language: 'en' | 'uz') {
  if (method === 'CASH') return language === 'uz' ? 'Naqd' : 'Cash'
  if (method === 'CARD') return language === 'uz' ? 'Karta' : 'Card'
  return language === 'uz' ? 'Boshqa' : 'Other'
}

function methodIcon(method: PurchaseDetail['paymentMethod']) {
  if (method === 'CASH') return Banknote
  if (method === 'CARD') return CreditCard
  return CircleDollarSign
}

function isRepairedNote(note?: string | null) {
  return note?.toLowerCase().includes('repaired') ?? false
}

function statusBadgeClass(status: string) {
  if (status === 'SOLD') {
    return 'bg-rose-500/10 text-rose-700 border-rose-200'
  }
  if (status === 'IN_REPAIR') {
    return 'bg-amber-500/10 text-amber-800 border-amber-200'
  }
  if (status === 'READY_FOR_SALE') {
    return 'bg-sky-500/10 text-sky-700 border-sky-200'
  }
  return 'bg-emerald-500/10 text-emerald-700 border-emerald-200'
}

function statusLabel(status: string, language: 'en' | 'uz') {
  if (status === 'SOLD') return language === 'uz' ? 'Sotilgan' : 'Sold'
  if (status === 'IN_REPAIR') return language === 'uz' ? "Ta'mirda" : 'In repair'
  if (status === 'READY_FOR_SALE') return language === 'uz' ? 'Sotuvga tayyor' : 'Ready for sale'
  return language === 'uz' ? 'Omborda' : 'In stock'
}

export function PurchaseDetailsModal({
  open,
  onOpenChange,
  purchase,
  canManage,
  onEdit,
  onAddPayment,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  purchase: PurchaseDetail | null
  canManage: boolean
  onEdit?: (purchase: PurchaseDetail) => void
  onAddPayment?: (purchase: PurchaseDetail) => void
}) {
  const { language } = useI18n()
  const Icon = purchase ? methodIcon(purchase.paymentMethod) : ReceiptText
  const repairedActivities = (purchase?.activities ?? []).filter((activity) =>
    isRepairedNote(activity.notes),
  )
  const repairedTotal = repairedActivities.reduce(
    (sum, activity) => sum + Number(activity.amount ?? 0),
    0,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl">
        <DialogHeader>
          <DialogTitle>{language === 'uz' ? 'Xarid tafsilotlari' : 'Purchase details'}</DialogTitle>
        </DialogHeader>

        {!purchase ? (
          <div className="text-sm text-muted-foreground">
            {language === 'uz' ? 'Xarid tanlanmagan' : 'No purchase selected'}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  {language === 'uz' ? 'Xarid ID' : 'Purchase ID'}
                </div>
                <div className="text-lg font-semibold">#{purchase.id}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(purchase.purchasedAt).toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-2xl border bg-muted/10 px-3 py-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">
                  {methodLabel(purchase.paymentMethod, language)}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border bg-muted/10 p-4">
                <div className="text-sm font-semibold">{language === 'uz' ? 'Mijoz' : 'Customer'}</div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-medium">
                      {purchase.customer?.id
                        ? `#${purchase.customer.id}`
                        : purchase.customerId
                          ? `#${purchase.customerId}`
                          : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {language === 'uz' ? "To'liq ism" : 'Full name'}
                    </span>
                    <span className="font-medium">
                      {purchase.customer?.fullName ?? '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {language === 'uz' ? 'Telefon' : 'Phone'}
                    </span>
                    <span className="font-medium">
                      {purchase.customer?.phoneNumber ?? '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {language === 'uz' ? 'Manzil' : 'Address'}
                    </span>
                    <span className="font-medium">
                      {purchase.customer?.address ?? '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border bg-muted/10 p-4">
                <div className="text-sm font-semibold">{language === 'uz' ? "To'lov" : 'Payment'}</div>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {language === 'uz' ? 'Turi' : 'Type'}
                    </span>
                    <span className="font-medium">{purchase.paymentType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{language === 'uz' ? 'Jami' : 'Total'}</span>
                    <span className="font-semibold">{money(purchase.totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {language === 'uz' ? "Hozir to'langan" : 'Paid now'}
                    </span>
                    <span className="font-medium">{money(purchase.paidNow)}</span>
                  </div>
                  {Number(purchase.remaining) > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {language === 'uz' ? 'Qolgan' : 'Remaining'}
                      </span>
                      <span className="font-medium">{money(purchase.remaining)}</span>
                    </div>
                  ) : null}
                  {repairedTotal > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {language === 'uz' ? "Ta'mirlangan" : 'Repaired'}
                      </span>
                      <span className="font-medium">{money(repairedTotal)}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border bg-muted/10 p-4">
              <div className="text-sm font-semibold">
                {language === 'uz' ? "To'lov izohi" : 'Payment note'}
              </div>
              <div className="mt-2 text-sm font-medium break-words whitespace-pre-wrap">
                {purchase.notes ?? '—'}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold">
                {language === 'uz' ? 'Telefonlar' : 'Items'} ({purchase.items.length})
              </div>

              <div className="rounded-3xl border overflow-hidden">
                <div className="divide-y">
                  {purchase.items.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium">
                          {entry.item.brand} {entry.item.model}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          IMEI: {entry.item.imei} • {language === 'uz' ? 'Holati' : 'Condition'}:{' '}
                          {entry.item.condition} • {language === 'uz' ? 'Holat' : 'Status'}:{' '}
                          <Badge
                            variant="secondary"
                            className={cn(
                              'ml-1 rounded-full border px-2 py-0 text-[10px] font-semibold',
                              statusBadgeClass(entry.item.status),
                            )}
                          >
                            {statusLabel(entry.item.status, language)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {language === 'uz' ? "Ma'lum nosozlik" : 'Known issue'}:{' '}
                          {entry.item.knownIssues ?? '—'}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {money(entry.purchasePrice)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-semibold">
                {language === 'uz' ? "To'lov faoliyatlari" : 'Payment activities'} ({purchase.activities?.length ?? 0})
              </div>
              <div className="rounded-3xl border overflow-hidden">
                <div className="divide-y">
                  {(purchase.activities ?? []).length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">
                      {language === 'uz'
                        ? "Hali to'lov faoliyati yo'q."
                        : 'No payment activity yet.'}
                    </div>
                  ) : (
                    purchase.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.paidAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-semibold">
                          {money(activity.amount)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.notes ?? '—'}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {canManage && Number(purchase.remaining) > 0 ? (
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  type="button"
                  onClick={() => onAddPayment?.(purchase)}
                >
                  <HandCoins className="mr-2 h-4 w-4" />
                  {language === 'uz' ? "To'lov qo'shish" : 'Add payment'}
                </Button>
              ) : null}
              {canManage ? (
                <Button
                  className="rounded-2xl"
                  type="button"
                  onClick={() => onEdit?.(purchase)}
                >
                  {language === 'uz' ? 'Xaridni tahrirlash' : 'Edit purchase'}
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
