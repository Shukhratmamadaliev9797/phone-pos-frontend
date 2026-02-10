import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, UserPlus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { CreateWorkerPayload, WorkerLoginRole, WorkerRole } from '@/lib/api/workers'
import { useI18n } from '@/lib/i18n/provider'

type JobCategory = 'ADMIN' | 'CASHIER' | 'TECHNICIAN' | 'CLEANER' | 'ACCOUNTANT'
type LoginRoleOption = 'ADMIN' | 'CASHIER' | 'TECHNICIAN'

type NewWorkerForm = {
  fullName: string
  jobCategory: JobCategory | ''
  phoneNumber: string
  address: string
  monthlySalary: string
  notes: string
  hasDashboardAccess: boolean
  loginEmail: string
  loginPassword: string
  loginRole: LoginRoleOption | ''
}

const initial: NewWorkerForm = {
  fullName: '',
  jobCategory: '',
  phoneNumber: '',
  address: '',
  monthlySalary: '',
  notes: '',
  hasDashboardAccess: false,
  loginEmail: '',
  loginPassword: '',
  loginRole: '',
}

function mapJobCategoryToWorkerRole(jobCategory: JobCategory): WorkerRole {
  if (jobCategory === 'ADMIN') return 'MANAGER'
  if (jobCategory === 'CASHIER') return 'CASHIER'
  if (jobCategory === 'TECHNICIAN') return 'TECHNICIAN'
  return 'OTHER'
}

function mapLoginRoleToUserRole(loginRole: LoginRoleOption): WorkerLoginRole {
  if (loginRole === 'ADMIN') return 'OWNER_ADMIN'
  if (loginRole === 'CASHIER') return 'CASHIER'
  return 'TECHNICIAN'
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function NewWorkerModal({
  open,
  onOpenChange,
  canManage,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  canManage: boolean
  onCreate?: (payload: CreateWorkerPayload) => Promise<void>
}) {
  const { language } = useI18n()
  const [value, setValue] = React.useState<NewWorkerForm>(initial)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setValue(initial)
      setSaving(false)
      setError(null)
    }
  }, [open])

  const monthlySalary = Number(value.monthlySalary)
  const baseValid =
    value.fullName.trim().length > 0 &&
    value.jobCategory.length > 0 &&
    value.phoneNumber.trim().length > 0 &&
    Number.isFinite(monthlySalary) &&
    monthlySalary > 0

  const loginValid =
    !value.hasDashboardAccess ||
    (isEmail(value.loginEmail.trim()) &&
      value.loginPassword.length >= 8 &&
      value.loginRole.length > 0)

  const canCreate = canManage && !saving && baseValid && loginValid

  async function handleCreate() {
    if (!canManage) {
      setError(language === 'uz' ? "Ruxsat yo'q" : 'Not allowed')
      return
    }

    if (!baseValid) {
      setError(
        language === 'uz'
          ? "Iltimos, majburiy maydonlarni to'ldiring va ish haqini 0 dan katta kiriting."
          : 'Please fill all required worker fields and set salary > 0.',
      )
      return
    }

    if (value.hasDashboardAccess) {
      if (!isEmail(value.loginEmail.trim())) {
        setError(language === 'uz' ? 'Login email noto‘g‘ri.' : 'Login email is invalid.')
        return
      }
      if (value.loginPassword.length < 8) {
        setError(
          language === 'uz'
            ? 'Login paroli kamida 8 ta belgidan iborat bo‘lishi kerak.'
            : 'Login password must be at least 8 characters.',
        )
        return
      }
      if (!value.loginRole) {
        setError(language === 'uz' ? 'Login roli majburiy.' : 'Login role is required.')
        return
      }
    }

    const payload: CreateWorkerPayload = {
      fullName: value.fullName.trim(),
      phoneNumber: value.phoneNumber.trim(),
      address: value.address.trim() || undefined,
      monthlySalary,
      workerRole: mapJobCategoryToWorkerRole(value.jobCategory as JobCategory),
      hasDashboardAccess: value.hasDashboardAccess,
      login: value.hasDashboardAccess
        ? {
            email: value.loginEmail.trim(),
            password: value.loginPassword,
            role: mapLoginRoleToUserRole(value.loginRole as LoginRoleOption),
          }
        : undefined,
      notes: value.notes.trim() || undefined,
    }

    try {
      setSaving(true)
      setError(null)
      await onCreate?.(payload)
      onOpenChange(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === 'uz'
            ? "Xodimni yaratib bo'lmadi"
            : 'Failed to create worker',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[min(94vw,36rem)] p-0 overflow-hidden rounded-3xl">
        <div className="flex flex-col">
          <div className="border-b p-6">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl">
                    {language === 'uz' ? 'Yangi xodim' : 'New Worker'}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {language === 'uz'
                      ? "Xodim profili va ixtiyoriy dashboard login yarating"
                      : 'Create worker profile and optional dashboard login'}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-2xl"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{language === 'uz' ? "To'liq ism" : 'Full Name'}</Label>
                <Input
                  className="h-10 rounded-2xl"
                  placeholder={language === 'uz' ? 'masalan: Jasur Akbarov' : 'e.g. Jasur Akbarov'}
                  value={value.fullName}
                  onChange={(e) => setValue((p) => ({ ...p, fullName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>{language === 'uz' ? 'Ish toifasi' : 'Job Category'}</Label>
                <Select
                  value={value.jobCategory || undefined}
                  onValueChange={(v) => setValue((p) => ({ ...p, jobCategory: v as JobCategory }))}
                >
                    <SelectTrigger className="h-10 rounded-2xl">
                      <SelectValue placeholder={language === 'uz' ? 'Toifani tanlang' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">{language === 'uz' ? 'Admin' : 'Admin'}</SelectItem>
                      <SelectItem value="CASHIER">{language === 'uz' ? 'Kassir' : 'Cashier'}</SelectItem>
                      <SelectItem value="TECHNICIAN">{language === 'uz' ? 'Texnik' : 'Technician'}</SelectItem>
                      <SelectItem value="CLEANER">{language === 'uz' ? 'Tozalovchi' : 'Cleaner'}</SelectItem>
                      <SelectItem value="ACCOUNTANT">{language === 'uz' ? 'Buxgalter' : 'Accountant'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              <div className="space-y-2">
                <Label>{language === 'uz' ? 'Oylik ish haqi' : 'Monthly Salary'}</Label>
                <Input
                  className="h-10 rounded-2xl"
                  placeholder={language === 'uz' ? 'masalan: 3000000' : 'e.g. 3000000'}
                  inputMode="numeric"
                  value={value.monthlySalary}
                  onChange={(e) =>
                    setValue((p) => ({
                      ...p,
                      monthlySalary: e.target.value.replace(/[^\d.]/g, ''),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{language === 'uz' ? 'Telefon raqami' : 'Phone Number'}</Label>
                <Input
                  className="h-10 rounded-2xl"
                  placeholder="+998 90 123 45 67"
                  value={value.phoneNumber}
                  onChange={(e) => setValue((p) => ({ ...p, phoneNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>{language === 'uz' ? 'Manzil (ixtiyoriy)' : 'Address (optional)'}</Label>
                <Input
                  className="h-10 rounded-2xl"
                  placeholder={language === 'uz' ? 'Manzil' : 'Address'}
                  value={value.address}
                  onChange={(e) => setValue((p) => ({ ...p, address: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>{language === 'uz' ? 'Izohlar (ixtiyoriy)' : 'Notes (optional)'}</Label>
                <Textarea
                  className="rounded-2xl"
                  placeholder={language === 'uz' ? 'Har qanday izoh...' : 'Any notes...'}
                  value={value.notes}
                  onChange={(e) => setValue((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="rounded-2xl border p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {language === 'uz'
                      ? "Dashboard uchun login ma'lumotlarini yaratish"
                      : 'Create dashboard login details'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'uz'
                      ? 'Xodimga dashboard akkauntiga kirish ruxsatini bering.'
                      : 'Enable worker access to dashboard account.'}
                  </p>
                </div>
                <Switch
                  checked={value.hasDashboardAccess}
                  onCheckedChange={(checked) => {
                    setValue((p) => {
                      const inferredRole =
                        p.jobCategory === 'ADMIN' ||
                        p.jobCategory === 'CASHIER' ||
                        p.jobCategory === 'TECHNICIAN'
                          ? p.jobCategory
                          : ''

                      return {
                        ...p,
                        hasDashboardAccess: checked,
                        loginRole: checked ? p.loginRole || inferredRole : '',
                      }
                    })
                  }}
                />
              </div>

              {value.hasDashboardAccess ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{language === 'uz' ? 'Email / Username' : 'Email / Username'}</Label>
                    <Input
                      className="h-10 rounded-2xl"
                      placeholder={language === 'uz' ? 'worker@pos.local' : 'worker@pos.local'}
                      value={value.loginEmail}
                      onChange={(e) => setValue((p) => ({ ...p, loginEmail: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'uz' ? 'Parol' : 'Password'}</Label>
                    <Input
                      type="password"
                      className="h-10 rounded-2xl"
                      placeholder={
                        language === 'uz' ? 'Kamida 8 ta belgi' : 'Minimum 8 characters'
                      }
                      value={value.loginPassword}
                      onChange={(e) => setValue((p) => ({ ...p, loginPassword: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'uz' ? 'Rol' : 'Role'}</Label>
                    <Select
                      value={value.loginRole || undefined}
                      onValueChange={(v) =>
                        setValue((p) => ({ ...p, loginRole: v as LoginRoleOption }))
                      }
                    >
                      <SelectTrigger className="h-10 rounded-2xl">
                        <SelectValue
                          placeholder={language === 'uz' ? 'Login rolini tanlang' : 'Select login role'}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">{language === 'uz' ? 'Admin' : 'Admin'}</SelectItem>
                        <SelectItem value="CASHIER">{language === 'uz' ? 'Kassir' : 'Cashier'}</SelectItem>
                        <SelectItem value="TECHNICIAN">{language === 'uz' ? 'Texnik' : 'Technician'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <div className="border-t p-4">
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
                {language === 'uz' ? 'Bekor qilish' : 'Cancel'}
              </Button>

              <Button className="rounded-2xl" disabled={!canCreate} onClick={handleCreate}>
                <UserPlus className="mr-2 h-4 w-4" />
                {saving
                  ? language === 'uz'
                    ? 'Yaratilmoqda...'
                    : 'Creating...'
                  : language === 'uz'
                    ? 'Xodim yaratish'
                    : 'Create worker'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
