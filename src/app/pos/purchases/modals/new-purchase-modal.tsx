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
import { AlertCircle, Save } from 'lucide-react'
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
import {
  getPhoneModelsByBrand,
  PHONE_BRAND_OPTIONS,
  PHONE_STORAGE_OPTIONS,
} from '@/lib/constants/phone-options'

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
  const [initialPayInput, setInitialPayInput] = useState('')
  const [initialPayError, setInitialPayError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [customerFullName, setCustomerFullName] = useState('')
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerFieldInvalid, setCustomerFieldInvalid] = useState({
    fullName: false,
    phoneNumber: false,
    address: false,
  })
  const [invalidPriceIndices, setInvalidPriceIndices] = useState<number[]>([])
  const [invalidItemFields, setInvalidItemFields] = useState<
    Record<
      number,
      {
        brand: boolean
        model: boolean
        storage: boolean
        condition: boolean
        imei: boolean
        status: boolean
      }
    >
  >({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (Number(item.purchasePrice) || 0), 0),
    [items],
  )
  const effectivePaidNow =
    paymentType === 'PAID_NOW' ? total : Number(initialPayInput || 0)
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
      setInitialPayInput('')
      setInitialPayError(null)
      setNotes('')
      setCustomerFullName('')
      setCustomerPhoneNumber('')
      setCustomerAddress('')
      setCustomerFieldInvalid({
        fullName: false,
        phoneNumber: false,
        address: false,
      })
      setInvalidPriceIndices([])
      setInvalidItemFields({})
      setError(null)
      return
    }
  }, [open])

  useEffect(() => {
    if (!requiresCustomer) {
      setCustomerFieldInvalid({
        fullName: false,
        phoneNumber: false,
        address: false,
      })
    }
  }, [requiresCustomer])

  useEffect(() => {
    if (paymentType !== 'PAY_LATER') {
      setInitialPayError(null)
    }
  }, [paymentType])
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
    const keyToFlag: Record<string, 'brand' | 'model' | 'storage' | 'condition' | 'imei' | 'status'> = {
      brand: 'brand',
      model: 'model',
      storage: 'storage',
      condition: 'condition',
      imei: 'imei',
      initialStatus: 'status',
    }
    const flag = keyToFlag[String(key)]
    if (flag) {
      setInvalidItemFields((prev) => {
        const row = prev[index]
        if (!row) return prev
        const next = { ...prev }
        next[index] = { ...row, [flag]: false }
        return next
      })
    }
    if (key === 'purchasePrice') {
      setInvalidPriceIndices((prev) => prev.filter((itemIndex) => itemIndex !== index))
    }
  }

  async function handleSave() {
    if (!canManage) {
      setError(tr.notAllowed)
      return
    }

    if (items.length !== 1) {
      setError(language === 'uz' ? "Bitta xaridda faqat bitta telefon bo'ladi" : 'Only one phone is allowed per purchase')
      return
    }

    const priceErrorIndices: number[] = []
    const itemFieldErrors: Record<
      number,
      {
        brand: boolean
        model: boolean
        storage: boolean
        condition: boolean
        imei: boolean
        status: boolean
      }
    > = {}
    for (const [index, item] of items.entries()) {
      itemFieldErrors[index] = {
        brand: !item.brand.trim(),
        model: !item.model.trim(),
        storage: !(item.storage ?? '').trim(),
        condition: !item.condition,
        imei: !item.imei?.trim(),
        status: !item.initialStatus,
      }
      if ((Number(item.purchasePrice) || 0) <= 0) {
        priceErrorIndices.push(index)
      }
    }
    const hasItemFieldError = Object.values(itemFieldErrors).some(
      (row) =>
        row.brand || row.model || row.storage || row.condition || row.imei || row.status,
    )
    if (hasItemFieldError) {
      setInvalidItemFields(itemFieldErrors)
      setError(
        language === 'uz'
          ? "Brand, model, storage, condition, IMEI va status majburiy."
          : 'Brand, model, storage, condition, IMEI and status are required.',
      )
      return
    }
    setInvalidItemFields({})
    if (priceErrorIndices.length > 0) {
      setInvalidPriceIndices(priceErrorIndices)
      setError(
        language === 'uz'
          ? "Phone price maydonini to'ldiring"
          : 'Phone price is required',
      )
      return
    }
    setInvalidPriceIndices([])

    if (paymentType === 'PAY_LATER' && !initialPayInput.trim()) {
      setInitialPayError(
        language === 'uz'
          ? "Initial pay maydonini to'ldiring."
          : 'Please fill the Initial pay field.',
      )
      setError(
        language === 'uz'
          ? "Pay later bo'lsa Initial pay majburiy."
          : 'Initial pay is required when Pay later is selected.',
      )
      return
    }
    setInitialPayError(null)

    const paid = paymentType === 'PAID_NOW' ? total : Number(initialPayInput || 0)

    const missingCustomerFields = {
      fullName: requiresCustomer && !customerFullName.trim(),
      phoneNumber: requiresCustomer && !customerPhoneNumber.trim(),
      address: requiresCustomer && !customerAddress.trim(),
    }
    setCustomerFieldInvalid(missingCustomerFields)

    if (missingCustomerFields.fullName || missingCustomerFields.phoneNumber || missingCustomerFields.address) {
      setError(
        language === 'uz'
          ? "Qarz/kredit xarid uchun mijoz ma'lumotlarini to'liq kiriting"
          : 'Please provide complete customer details for debt/credit purchase',
      )
      return
    }

    if (paid > total) {
      setInitialPayError(
        language === 'uz'
          ? "Initial pay phone price'dan katta bo'lishi mumkin emas."
          : 'Initial pay cannot be greater than phone price.',
      )
      setError(
        language === 'uz'
          ? "paidNow jami summadan katta bo'lishi mumkin emas"
          : 'paidNow cannot be greater than total',
      )
      return
    }
    setInitialPayError(null)

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
      <DialogContent className="max-w-6xl w-[min(94vw,72rem)] h-[90vh] p-0 overflow-hidden rounded-3xl">
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
              </CardHeader>

              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Brand *</Label>
                        <Select
                          value={item.brand || undefined}
                          onValueChange={(value) => {
                            updateItem(index, 'brand', value)
                            updateItem(index, 'model', '')
                          }}
                        >
                          <SelectTrigger
                            className={`w-full ${
                              invalidItemFields[index]?.brand
                                ? 'border-destructive focus-visible:ring-destructive/30'
                                : ''
                            }`}
                          >
                            <SelectValue placeholder={language === 'uz' ? 'Brendni tanlang' : 'Select brand'} />
                          </SelectTrigger>
                          <SelectContent className="w-[--radix-select-trigger-width]">
                            {PHONE_BRAND_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Model *</Label>
                        <Select
                          value={item.model || undefined}
                          onValueChange={(value) => updateItem(index, 'model', value)}
                          disabled={!item.brand}
                        >
                          <SelectTrigger
                            className={`w-full ${
                              invalidItemFields[index]?.model
                                ? 'border-destructive focus-visible:ring-destructive/30'
                                : ''
                            }`}
                          >
                            <SelectValue
                              placeholder={
                                !item.brand
                                  ? language === 'uz'
                                    ? 'Avval brendni tanlang'
                                    : 'Select brand first'
                                  : language === 'uz'
                                    ? 'Modelni tanlang'
                                    : 'Select model'
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="w-[--radix-select-trigger-width]">
                            {getPhoneModelsByBrand(item.brand).map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Storage *</Label>
                        <Select
                          value={item.storage || undefined}
                          onValueChange={(value) => updateItem(index, 'storage', value)}
                        >
                          <SelectTrigger
                            className={`w-full ${
                              invalidItemFields[index]?.storage
                                ? 'border-destructive focus-visible:ring-destructive/30'
                                : ''
                            }`}
                          >
                            <SelectValue placeholder={language === 'uz' ? 'Xotirani tanlang' : 'Select storage'} />
                          </SelectTrigger>
                          <SelectContent className="w-[--radix-select-trigger-width]">
                            {PHONE_STORAGE_OPTIONS.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Condition *</Label>
                        <Select
                          value={item.condition}
                          onValueChange={(value) => updateItem(index, 'condition', value as PhoneCondition)}
                        >
                          <SelectTrigger
                            className={`w-full ${
                              invalidItemFields[index]?.condition
                                ? 'border-destructive focus-visible:ring-destructive/30'
                                : ''
                            }`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="w-[--radix-select-trigger-width]">
                            <SelectItem value="GOOD">Good</SelectItem>
                            <SelectItem value="USED">Used</SelectItem>
                            <SelectItem value="BROKEN">Broken</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>IMEI *</Label>
                        <Input
                          className={`w-full ${
                            invalidItemFields[index]?.imei
                              ? 'border-destructive focus-visible:ring-destructive/30'
                              : ''
                          }`}
                          value={item.imei ?? ''}
                          onChange={(event) => updateItem(index, 'imei', event.target.value)}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Status *</Label>
                        <Select
                          value={item.initialStatus}
                          onValueChange={(value) => updateItem(index, 'initialStatus', value as PhoneStatus)}
                        >
                          <SelectTrigger
                            className={`w-full ${
                              invalidItemFields[index]?.status
                                ? 'border-destructive focus-visible:ring-destructive/30'
                                : ''
                            }`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="w-[--radix-select-trigger-width]">
                            <SelectItem value="READY_FOR_SALE">Ready for sale</SelectItem>
                            <SelectItem value="IN_REPAIR">In Repair</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <Label>Phone price *</Label>
                        <Input
                          className={`w-full ${
                            invalidPriceIndices.includes(index)
                              ? 'border-destructive focus-visible:ring-destructive/30'
                              : ''
                          }`}
                          type="number"
                          inputMode="decimal"
                          placeholder={language === 'uz' ? "masalan: 1 200 000 so'm" : "e.g. 1,200,000 so'm"}
                          value={item.purchasePrice ? String(item.purchasePrice) : ''}
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
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-[--radix-select-trigger-width]">
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label>Payment type</Label>
                    <Select value={paymentType} onValueChange={(value) => setPaymentType(value as PurchasePaymentType)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-[--radix-select-trigger-width]">
                        <SelectItem value="PAID_NOW">Full payment</SelectItem>
                        <SelectItem value="PAY_LATER">Pay later</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {paymentType === 'PAY_LATER' ? (
                  <div className="space-y-1">
                    <Label>Initial pay</Label>
                    <Input
                      className={`w-full ${initialPayError ? 'border-destructive focus-visible:ring-destructive/30' : ''}`}
                      type="number"
                      inputMode="decimal"
                      placeholder={language === 'uz' ? "masalan: 300 000 so'm" : "e.g. 300,000 so'm"}
                      value={initialPayInput}
                      onChange={(event) => {
                        setInitialPayInput(event.target.value.replace(/[^\d.]/g, ''))
                        if (initialPayError) {
                          setInitialPayError(null)
                        }
                      }}
                    />
                    {initialPayError ? (
                      <div
                        role="alert"
                        className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-rose-300/60 bg-rose-500/10 p-3 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold">
                              {language === 'uz' ? 'Xato' : 'Validation error'}
                            </p>
                            <p className="text-sm leading-5">{initialPayError}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="rounded-md border bg-muted/10 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">{money(total)}</span>
                  </div>
                  {paymentType === 'PAY_LATER' ? (
                    <div className="mt-2 flex justify-between">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold">{money(Math.max(0, remaining))}</span>
                    </div>
                  ) : null}
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
                      Full name {requiresCustomer ? '*' : ''}
                    </Label>
                    <Input
                      className={customerFieldInvalid.fullName ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                      value={customerFullName}
                      onChange={(event) => {
                        setCustomerFullName(event.target.value)
                        if (customerFieldInvalid.fullName) {
                          setCustomerFieldInvalid((prev) => ({ ...prev, fullName: false }))
                        }
                      }}
                      placeholder="Customer full name"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>
                      Phone number {requiresCustomer ? '*' : ''}
                    </Label>
                    <Input
                      className={customerFieldInvalid.phoneNumber ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                      value={customerPhoneNumber}
                      onChange={(event) => {
                        setCustomerPhoneNumber(event.target.value)
                        if (customerFieldInvalid.phoneNumber) {
                          setCustomerFieldInvalid((prev) => ({ ...prev, phoneNumber: false }))
                        }
                      }}
                      placeholder="+998901234567"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label>Address {requiresCustomer ? '*' : ''}</Label>
                    <Input
                      className={customerFieldInvalid.address ? 'border-destructive focus-visible:ring-destructive/30' : ''}
                      value={customerAddress}
                      onChange={(event) => {
                        setCustomerAddress(event.target.value)
                        if (customerFieldInvalid.address) {
                          setCustomerFieldInvalid((prev) => ({ ...prev, address: false }))
                        }
                      }}
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

            {error ? (
              <div
                role="alert"
                className="animate-in fade-in slide-in-from-top-2 duration-300 rounded-xl border border-rose-300/60 bg-rose-500/10 p-3 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-200"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">
                      {language === 'uz' ? "Saqlashda xato" : 'Save failed'}
                    </p>
                    <p className="text-sm leading-5">{error}</p>
                  </div>
                </div>
              </div>
            ) : null}
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
