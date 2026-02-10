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
import { Plus, Trash2, Save } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  type CreatePurchasePayload,
  type PurchasePaymentMethod,
  type PurchasePaymentType,
} from '@/lib/api/purchases'
import type {
  PhoneCondition,
  PhoneItemDraft,
  PhoneStatus,
} from '../types'
import { emptyPhone } from '../data'
import { useI18n } from '@/lib/i18n/provider'

const money = (n: number) => `${Math.max(0, n).toLocaleString('en-US')} so'm`

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  canManage: boolean
  onSubmit: (payload: CreatePurchasePayload) => Promise<void>
}

export function NewPurchaseModal({
  open,
  onOpenChange,
  canManage,
  onSubmit,
}: Props) {
  const { language } = useI18n()
  const [items, setItems] = useState<PhoneItemDraft[]>([emptyPhone()])
  const [paymentMethod, setPaymentMethod] = useState<PurchasePaymentMethod>('CASH')
  const [paymentType, setPaymentType] = useState<PurchasePaymentType>('PAID_NOW')
  const [paidNow, setPaidNow] = useState(0)
  const [notes, setNotes] = useState('')
  const [customerFullName, setCustomerFullName] = useState('')
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.purchasePrice) || 0), 0),
    [items],
  )
  const effectivePaidNow =
    paymentType === 'PAID_NOW' ? total : Number(paidNow) || 0
  const remaining = total - effectivePaidNow
  const requiresCustomer = paymentType === 'PAY_LATER' || remaining > 0
  const tr = {
    notAllowed: language === 'uz' ? "Ruxsat yo'q" : 'Not allowed',
    saveFailed: language === 'uz' ? "Xaridni saqlab bo'lmadi" : 'Failed to save purchase',
  }

  useEffect(() => {
    if (!open) {
      setItems([emptyPhone()])
      setPaymentMethod('CASH')
      setPaymentType('PAID_NOW')
      setPaidNow(0)
      setNotes('')
      setCustomerFullName('')
      setCustomerPhoneNumber('')
      setCustomerAddress('')
      setError(null)
      return
    }
  }, [open])
  const addItem = () => setItems((prev) => [...prev, emptyPhone()])
  const removeItem = (index: number) =>
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index))

  const updateItem = <K extends keyof PhoneItemDraft>(
    index: number,
    key: K,
    value: PhoneItemDraft[K],
  ) => {
    setItems((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [key]: value }
      return next
    })
  }

  async function handleSave() {
    if (!canManage) {
      setError(tr.notAllowed)
      return
    }

    if (items.length === 0) {
      setError('At least one item is required')
      return
    }

    for (const item of items) {
      if (!item.imei?.trim()) {
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

    const paid = paymentType === 'PAID_NOW' ? total : Number(paidNow) || 0

    if (requiresCustomer && (!customerFullName.trim() || !customerPhoneNumber.trim())) {
      setError(
        language === 'uz'
          ? "Qarz/kredit xarid uchun mijoz to'liq ismi va telefoni majburiy"
          : 'Customer full name and phone number are required for debt/credit purchase',
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

    const payload: CreatePurchasePayload = {
      paymentMethod,
      paymentType,
      paidNow: paid,
      notes: notes || undefined,
      customer: requiresCustomer
        ? {
            fullName: customerFullName.trim(),
            phoneNumber: customerPhoneNumber.trim(),
            address: customerAddress.trim() || undefined,
          }
        : undefined,
      items: items.map((item) => ({
        imei: item.imei?.trim() || '',
        serialNumber: undefined,
        brand: item.brand,
        model: item.model,
        storage: item.storage || undefined,
        color: item.color || undefined,
        condition: item.condition,
        knownIssues: item.issues || undefined,
        purchasePrice: Number(item.purchasePrice),
        initialStatus: item.initialStatus,
      })),
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(payload)
      onOpenChange(false)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : tr.saveFailed
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!canManage && value) {
          setError(tr.notAllowed)
          return
        }
        onOpenChange(value)
      }}
    >
      <DialogContent className="max-w-5xl w-[min(92vw,64rem)] h-[90vh] p-0 overflow-hidden rounded-3xl">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <DialogTitle>{language === 'uz' ? 'Yangi xarid' : 'New Purchase'}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {language === 'uz'
                  ? "Mijozdan telefon xarid qiling (hozir yoki keyin to'lash)"
                  : 'Buy phones from customer (pay now or pay later)'}
              </p>
            </DialogHeader>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
            <Card className="rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {language === 'uz' ? 'Telefonlar' : 'Phone items'}
                </CardTitle>
                <Button size="sm" className="rounded-2xl" onClick={addItem} type="button">
                  <Plus className="mr-2 h-4 w-4" /> {language === 'uz' ? "Telefon qo'shish" : 'Add phone'}
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="rounded-2xl border p-4 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold">Item #{index + 1}</span>
                      {items.length > 1 ? (
                        <Button variant="ghost" size="icon" onClick={() => removeItem(index)} type="button">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Brand</Label>
                        <Input value={item.brand} onChange={(event) => updateItem(index, 'brand', event.target.value)} />
                      </div>

                      <div className="space-y-1">
                        <Label>Model</Label>
                        <Input value={item.model} onChange={(event) => updateItem(index, 'model', event.target.value)} />
                      </div>

                      <div className="space-y-1">
                        <Label>Storage</Label>
                        <Input value={item.storage} onChange={(event) => updateItem(index, 'storage', event.target.value)} />
                      </div>

                      <div className="space-y-1">
                        <Label>IMEI</Label>
                        <Input value={item.imei ?? ''} onChange={(event) => updateItem(index, 'imei', event.target.value)} />
                      </div>

                      <div className="space-y-1">
                        <Label>Condition</Label>
                        <Select
                          value={item.condition}
                          onValueChange={(value) => updateItem(index, 'condition', value as PhoneCondition)}
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
                          onValueChange={(value) => updateItem(index, 'initialStatus', value as PhoneStatus)}
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
                          onChange={(event) => updateItem(index, 'purchasePrice', Number(event.target.value || 0))}
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <Label>Known issues</Label>
                        <Textarea value={item.issues ?? ''} onChange={(event) => updateItem(index, 'issues', event.target.value)} />
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
                    <Label>Payment method</Label>
                    <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PurchasePaymentMethod)}>
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
                    <Select value={paymentType} onValueChange={(value) => setPaymentType(value as PurchasePaymentType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PAID_NOW">Paid now</SelectItem>
                        <SelectItem value="PAY_LATER">Pay later</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paymentType === 'PAY_LATER' ? (
                  <div className="space-y-1">
                    <Label>Paid now</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={String(paidNow ?? 0)}
                      onChange={(event) => setPaidNow(Number(event.target.value || 0))}
                    />
                  </div>
                ) : null}

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

                {requiresCustomer ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Pay later or partial payment bo'lsa customer ma'lumotlari saqlanadi va
                    purchase shu customerga bog'lanadi.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-muted-foreground">
                    To'liq to'langan purchase uchun customer ma'lumotlari ixtiyoriy.
                  </p>
                )}
              </CardContent>
            </Card>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="border-t p-4">
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-2xl">
                {language === 'uz' ? 'Bekor qilish' : 'Cancel'}
              </Button>

              <Button className="rounded-2xl" type="button" onClick={handleSave} disabled={submitting}>
                <Save className="mr-2 h-4 w-4" />
                {submitting
                  ? language === 'uz'
                    ? 'Saqlanmoqda...'
                    : 'Saving...'
                  : language === 'uz'
                    ? 'Xaridni saqlash'
                    : 'Save Purchase'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
