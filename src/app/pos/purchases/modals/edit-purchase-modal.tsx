import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Save } from 'lucide-react'
import type {
  PurchaseDetail,
  PurchasePaymentMethod,
  PurchasePaymentType,
  UpdatePurchasePayload,
} from '@/lib/api/purchases'
import type { PhoneCondition, PhoneStatus } from '../types'
import { useI18n } from '@/lib/i18n/provider'

type EditPurchaseModalProps = {
  open: boolean
  purchase: PurchaseDetail | null
  canManage: boolean
  onClose: () => void
  onSubmit: (id: number, body: UpdatePurchasePayload) => Promise<void>
}

const money = (n: number) => `${Math.max(0, n).toLocaleString('en-US')} so'm`

type EditableItem = {
  itemId?: number
  imei: string
  serialNumber: string
  brand: string
  model: string
  storage: string
  color: string
  condition: PhoneCondition
  knownIssues: string
  initialStatus: PhoneStatus
  purchasePrice: number
}

export function EditPurchaseModal({
  open,
  purchase,
  canManage,
  onClose,
  onSubmit,
}: EditPurchaseModalProps) {
  const { language } = useI18n()
  const [purchasedAt, setPurchasedAt] = React.useState('')
  const [items, setItems] = React.useState<EditableItem[]>([])
  const [customerFullName, setCustomerFullName] = React.useState('')
  const [customerPhoneNumber, setCustomerPhoneNumber] = React.useState('')
  const [customerAddress, setCustomerAddress] = React.useState('')
  const [paymentMethod, setPaymentMethod] =
    React.useState<PurchasePaymentMethod>('CASH')
  const [paymentType, setPaymentType] =
    React.useState<PurchasePaymentType>('PAID_NOW')
  const [paidNow, setPaidNow] = React.useState(0)
  const [notes, setNotes] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [phoneError, setPhoneError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!purchase || !open) return
    setPurchasedAt(new Date(purchase.purchasedAt).toISOString().slice(0, 16))
    setItems(
      purchase.items.map((entry) => ({
        itemId: entry.itemId,
        imei: entry.item.imei ?? '',
        serialNumber: entry.item.serialNumber ?? '',
        brand: entry.item.brand ?? '',
        model: entry.item.model ?? '',
        storage: entry.item.storage ?? '',
        color: entry.item.color ?? '',
        condition: entry.item.condition as PhoneCondition,
        knownIssues: entry.item.knownIssues ?? '',
        initialStatus:
          entry.item.status === 'IN_REPAIR' ? 'IN_REPAIR' : 'IN_STOCK',
        purchasePrice: Number(entry.purchasePrice),
      })),
    )
    setCustomerFullName(purchase.customer?.fullName ?? '')
    setCustomerPhoneNumber(purchase.customer?.phoneNumber ?? '')
    setCustomerAddress(purchase.customer?.address ?? '')
    setPaymentMethod(purchase.paymentMethod)
    setPaymentType(purchase.paymentType)
    setPaidNow(Number(purchase.paidNow))
    setNotes(purchase.notes ?? '')
    setError(null)
    setPhoneError(null)
  }, [purchase, open])

  const total = React.useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.purchasePrice) || 0), 0),
    [items],
  )
  const effectivePaidNow = paymentType === 'PAID_NOW' ? total : Number(paidNow) || 0
  const remaining = total - effectivePaidNow
  const requiresCustomer = paymentType === 'PAY_LATER' || remaining > 0
  const tr = {
    notAllowed: language === 'uz' ? "Ruxsat yo'q" : 'Not allowed',
    updateFailed: language === 'uz' ? "Xaridni yangilab bo'lmadi" : 'Failed to update purchase',
  }

  const updateItem = <K extends keyof EditableItem>(
    index: number,
    key: K,
    value: EditableItem[K],
  ) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  async function handleSubmit() {
    if (!purchase) return

    if (!canManage) {
      setError(tr.notAllowed)
      return
    }

    if (items.length !== 1) {
      setError(
        language === 'uz'
          ? "Bitta xaridda faqat bitta telefon bo'ladi"
          : 'Only one phone is allowed per purchase',
      )
      return
    }

    for (const item of items) {
      if (!item.imei.trim()) {
        setError(
          language === 'uz' ? 'Har bir item uchun IMEI majburiy' : 'IMEI is required for every item',
        )
        return
      }
      if (!item.brand.trim() || !item.model.trim()) {
        setError(
          language === 'uz'
            ? 'Har bir item uchun brand va model majburiy'
            : 'Brand and model are required for every item',
        )
        return
      }
      if ((Number(item.purchasePrice) || 0) <= 0) {
        setError(
          language === 'uz'
            ? 'purchasePrice 0 dan katta bo‘lishi kerak'
            : 'purchasePrice must be greater than 0',
        )
        return
      }
    }

    setPhoneError(null)
    const paid = paymentType === 'PAID_NOW' ? total : Number(paidNow) || 0

    if (!Number.isFinite(paid) || paid < 0) {
      setError(
        language === 'uz'
          ? "paidNow musbat va to'g'ri son bo'lishi kerak"
          : 'paidNow must be a valid positive number',
      )
      return
    }

    if (paid > total) {
      setError(
        language === 'uz'
          ? "paidNow jami summadan katta bo'lishi mumkin emas"
          : 'paidNow cannot be greater than total',
      )
      return
    }

    const hasCustomerName = customerFullName.trim().length > 0
    const hasCustomerPhone = customerPhoneNumber.trim().length > 0

    if (hasCustomerName && !hasCustomerPhone) {
      setPhoneError(
        language === 'uz'
          ? "Mijoz ismi kiritilganda telefon raqami ham majburiy."
          : 'Phone number is required when customer name is entered.',
      )
      return
    }

    if (requiresCustomer && (!customerFullName.trim() || !customerPhoneNumber.trim())) {
      setError(
        language === 'uz'
          ? "Pay-later yoki remaining bor bo'lsa mijoz to'liq ismi va telefoni majburiy"
          : 'Customer full name and phone number are required for pay-later or remaining balance',
      )
      return
    }

    const payload: UpdatePurchasePayload = {
      purchasedAt: purchasedAt ? new Date(purchasedAt).toISOString() : undefined,
      customer:
        customerFullName.trim() || customerPhoneNumber.trim() || customerAddress.trim()
          ? {
              fullName: customerFullName.trim() || undefined,
              phoneNumber: customerPhoneNumber.trim() || undefined,
              address: customerAddress.trim() || undefined,
            }
          : undefined,
      paymentMethod,
      paymentType,
      paidNow: paid,
      notes: notes || undefined,
      items: items.map((item) => ({
        itemId: item.itemId,
        imei: item.imei.trim(),
        serialNumber: item.serialNumber.trim() || undefined,
        brand: item.brand.trim(),
        model: item.model.trim(),
        storage: item.storage.trim() || undefined,
        color: item.color.trim() || undefined,
        condition: item.condition,
        knownIssues: item.knownIssues.trim() || undefined,
        initialStatus: item.initialStatus,
        purchasePrice: Number(item.purchasePrice),
      })),
    }

    try {
      setLoading(true)
      setError(null)
      await onSubmit(purchase.id, payload)
      onClose()
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : tr.updateFailed
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-6xl w-[min(94vw,72rem)] h-[90vh] p-0 overflow-hidden rounded-3xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <DialogTitle>{language === 'uz' ? 'Xaridni tahrirlash' : 'Edit Purchase'}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'uz'
                  ? "Xarid ma'lumotlari va to'lov maydonlarini yangilang"
                  : 'Update purchase metadata and payment fields'}
              </p>
            </DialogHeader>
          </div>

          {!purchase ? (
            <div className="p-6 text-sm text-muted-foreground">
              {language === 'uz' ? 'Xarid tanlanmagan' : 'No purchase selected'}
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              <Card className="rounded-3xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    {language === 'uz' ? 'Telefonlar' : 'Phone items'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => (
                    <div key={`${item.itemId ?? 'new'}-${index}`} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>Brand</Label>
                          <Input
                            value={item.brand}
                            onChange={(event) => updateItem(index, 'brand', event.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label>Model</Label>
                          <Input
                            value={item.model}
                            onChange={(event) => updateItem(index, 'model', event.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label>Storage</Label>
                          <Input
                            value={item.storage}
                            onChange={(event) => updateItem(index, 'storage', event.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label>Color</Label>
                          <Input
                            value={item.color}
                            onChange={(event) => updateItem(index, 'color', event.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label>Serial number</Label>
                          <Input
                            value={item.serialNumber}
                            onChange={(event) =>
                              updateItem(index, 'serialNumber', event.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-1">
                          <Label>IMEI</Label>
                          <Input
                            value={item.imei}
                            onChange={(event) => updateItem(index, 'imei', event.target.value)}
                          />
                        </div>

                        <div className="space-y-1">
                          <Label>Condition</Label>
                          <Select
                            value={item.condition}
                            onValueChange={(value) =>
                              updateItem(index, 'condition', value as PhoneCondition)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GOOD">Good</SelectItem>
                              <SelectItem value="USED">Used</SelectItem>
                              <SelectItem value="BROKEN">Broken</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1">
                          <Label>Initial status</Label>
                          <Select
                            value={item.initialStatus}
                            onValueChange={(value) =>
                              updateItem(index, 'initialStatus', value as PhoneStatus)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IN_STOCK">In Stock</SelectItem>
                              <SelectItem value="IN_REPAIR">In Repair</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <Label>Purchase price</Label>
                          <Input
                            type="number"
                            inputMode="decimal"
                            value={String(item.purchasePrice ?? 0)}
                            onChange={(event) =>
                              updateItem(
                                index,
                                'purchasePrice',
                                Number(event.target.value || 0),
                              )
                            }
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <Label>Known issues</Label>
                          <Textarea
                            value={item.knownIssues}
                            onChange={(event) =>
                              updateItem(index, 'knownIssues', event.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Separator />

              <Card className="rounded-3xl">
                <CardHeader>
                <CardTitle className="text-base">{language === 'uz' ? "To'lov" : 'Payment'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Purchased at</Label>
                      <Input
                        type="datetime-local"
                        value={purchasedAt}
                        onChange={(event) => setPurchasedAt(event.target.value)}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Payment method</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={(value) =>
                          setPaymentMethod(value as PurchasePaymentMethod)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="CARD">Card</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label>Payment type</Label>
                      <Select
                        value={paymentType}
                        onValueChange={(value) =>
                          setPaymentType(value as PurchasePaymentType)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PAID_NOW">Paid now</SelectItem>
                          <SelectItem value="PAY_LATER">Pay later</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {paymentType === 'PAY_LATER' ? (
                      <div className="space-y-1">
                        <Label>Paid now</Label>
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={String(paidNow ?? 0)}
                          onChange={(event) =>
                            setPaidNow(Number(event.target.value || 0))
                          }
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border bg-muted/10 p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-semibold">{money(total)}</span>
                    </div>
                    <div className="mt-2 flex justify-between">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold">{money(Math.max(0, remaining))}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Notes</Label>
                    <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
                  </div>
                </CardContent>
              </Card>

              <Separator />

              <Card className="rounded-3xl">
                <CardHeader>
                <CardTitle className="text-base">{language === 'uz' ? 'Mijoz' : 'Customer'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>
                        Full name {requiresCustomer ? '(required)' : '(optional)'}
                      </Label>
                      <Input
                        value={customerFullName}
                        onChange={(event) => setCustomerFullName(event.target.value)}
                        placeholder="Customer full name"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>
                        Phone number {requiresCustomer ? '(required)' : '(optional)'}
                      </Label>
                      {phoneError ? (
                        <p className="text-xs text-destructive">{phoneError}</p>
                      ) : null}
                      <Input
                        value={customerPhoneNumber}
                        onChange={(event) => setCustomerPhoneNumber(event.target.value)}
                        placeholder="+998901234567"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label>Address (optional)</Label>
                      <Input
                        value={customerAddress}
                        onChange={(event) => setCustomerAddress(event.target.value)}
                        placeholder="Customer address"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>
          )}

          <div className="border-t p-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={onClose} className="rounded-2xl">
                {language === 'uz' ? 'Bekor qilish' : 'Cancel'}
              </Button>

              <Button
                className="rounded-2xl"
                type="button"
                onClick={() => void handleSubmit()}
                disabled={loading || !purchase}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading
                  ? language === 'uz'
                    ? 'Saqlanmoqda...'
                    : 'Saving...'
                  : language === 'uz'
                    ? "O'zgarishlarni saqlash"
                    : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
