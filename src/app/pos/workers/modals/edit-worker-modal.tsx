import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Eye, EyeOff, Pencil, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { UpdateWorkerPayload, WorkerDetailsView } from '@/lib/api/workers'
import { useI18n } from '@/lib/i18n/provider'

type JobCategory = 'ADMIN' | 'CASHIER' | 'TECHNICIAN' | 'CLEANER' | 'ACCOUNTANT'
type LoginRoleOption = 'ADMIN' | 'CASHIER' | 'TECHNICIAN'

type EditWorkerForm = {
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

function mapWorkerRoleToCategory(role: WorkerDetailsView['workerRole']): JobCategory {
  if (role === 'MANAGER') return 'ADMIN'
  if (role === 'CASHIER') return 'CASHIER'
  if (role === 'TECHNICIAN') return 'TECHNICIAN'
  return 'CLEANER'
}

function mapJobCategoryToWorkerRole(category: JobCategory): UpdateWorkerPayload['workerRole'] {
  if (category === 'ADMIN') return 'MANAGER'
  if (category === 'CASHIER') return 'CASHIER'
  if (category === 'TECHNICIAN') return 'TECHNICIAN'
  return 'OTHER'
}

function mapLoginRoleToUserRole(role: LoginRoleOption): 'OWNER_ADMIN' | 'CASHIER' | 'TECHNICIAN' {
  if (role === 'ADMIN') return 'OWNER_ADMIN'
  if (role === 'CASHIER') return 'CASHIER'
  return 'TECHNICIAN'
}

function mapUserRoleToLoginRole(
  workerRole: WorkerDetailsView['workerRole'],
): LoginRoleOption {
  if (workerRole === 'CASHIER') return 'CASHIER'
  if (workerRole === 'TECHNICIAN') return 'TECHNICIAN'
  return 'ADMIN'
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function buildInitial(worker: WorkerDetailsView | null): EditWorkerForm {
  if (!worker) {
    return {
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
  }

  return {
    fullName: worker.fullName,
    jobCategory: mapWorkerRoleToCategory(worker.workerRole),
    phoneNumber: worker.phoneNumber,
    address: worker.address ?? '',
    monthlySalary: String(Number(worker.monthlySalary ?? 0)),
    notes: worker.notes ?? '',
    hasDashboardAccess: worker.hasDashboardAccess,
    loginEmail: worker.loginEmail ?? '',
    loginPassword: '',
    loginRole: mapUserRoleToLoginRole(worker.workerRole),
  }
}

export function EditWorkerModal({
  open,
  onOpenChange,
  worker,
  canManage,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  worker: WorkerDetailsView | null
  canManage: boolean
  onSave: (workerId: number, payload: UpdateWorkerPayload) => Promise<void>
}) {
  const { language } = useI18n()
  const [value, setValue] = React.useState<EditWorkerForm>(buildInitial(worker))
  const [showPassword, setShowPassword] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open) {
      setValue(buildInitial(worker))
      setShowPassword(false)
      setSaving(false)
      setError(null)
    }
  }, [open, worker])

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
      value.loginRole.length > 0 &&
      (value.loginPassword.length === 0 || value.loginPassword.length >= 8))

  async function handleSave() {
    if (!canManage) {
      setError(language === 'uz' ? "Ruxsat yo'q" : 'Not allowed')
      return
    }
    if (!worker) {
      setError(language === 'uz' ? 'Xodim tanlanmagan' : 'Worker not selected')
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
    if (value.hasDashboardAccess && !isEmail(value.loginEmail.trim())) {
      setError(language === 'uz' ? 'Login email noto‘g‘ri.' : 'Login email is invalid.')
      return
    }

    const payload: UpdateWorkerPayload = {
      fullName: value.fullName.trim(),
      phoneNumber: value.phoneNumber.trim(),
      address: value.address.trim() || undefined,
      monthlySalary,
      workerRole: mapJobCategoryToWorkerRole(value.jobCategory as JobCategory),
      hasDashboardAccess: value.hasDashboardAccess,
      notes: value.notes.trim() || undefined,
      login: value.hasDashboardAccess
        ? {
            email: value.loginEmail.trim(),
            role: mapLoginRoleToUserRole(value.loginRole as LoginRoleOption),
            password: value.loginPassword.trim() || undefined,
          }
        : undefined,
    }

    try {
      setSaving(true)
      setError(null)
      await onSave(worker.id, payload)
      onOpenChange(false)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === 'uz'
            ? "Xodimni yangilab bo'lmadi"
            : 'Failed to update worker',
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
                    {language === 'uz' ? 'Xodimni tahrirlash' : 'Edit Worker'}
                  </DialogTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {language === 'uz'
                      ? "Xodim profili va dashboard login ma'lumotlarini yangilang"
                      : 'Update worker profile and dashboard login details'}
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
                  value={value.phoneNumber}
                  onChange={(e) => setValue((p) => ({ ...p, phoneNumber: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>{language === 'uz' ? 'Manzil (ixtiyoriy)' : 'Address (optional)'}</Label>
                <Input
                  className="h-10 rounded-2xl"
                  value={value.address}
                  onChange={(e) => setValue((p) => ({ ...p, address: e.target.value }))}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>{language === 'uz' ? 'Izohlar (ixtiyoriy)' : 'Notes (optional)'}</Label>
                <Textarea
                  className="rounded-2xl"
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
                  onCheckedChange={(checked) =>
                    setValue((p) => ({
                      ...p,
                      hasDashboardAccess: checked,
                    }))
                  }
                />
              </div>

              {value.hasDashboardAccess ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{language === 'uz' ? 'Email / Username' : 'Email / Username'}</Label>
                    <Input
                      className="h-10 rounded-2xl"
                      value={value.loginEmail}
                      onChange={(e) => setValue((p) => ({ ...p, loginEmail: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'uz' ? 'Parolni yangilash (ixtiyoriy)' : 'Reset Password (optional)'}</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        className="h-10 rounded-2xl pr-10"
                        placeholder={
                          language === 'uz'
                            ? 'Joriy parolni saqlash uchun bo‘sh qoldiring'
                            : 'Leave empty to keep current'
                        }
                        value={value.loginPassword}
                        onChange={(e) =>
                          setValue((p) => ({ ...p, loginPassword: e.target.value }))
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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
              <Button className="rounded-2xl" disabled={!baseValid || !loginValid || saving} onClick={handleSave}>
                <Pencil className="mr-2 h-4 w-4" />
                {saving
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
