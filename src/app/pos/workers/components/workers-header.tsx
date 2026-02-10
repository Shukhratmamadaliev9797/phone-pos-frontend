import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Briefcase, Plus } from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'

export function WorkersPageHeader({
  canManage,
  onNewWorker,
}: {
  canManage: boolean
  onNewWorker?: () => void
}) {
  const { language } = useI18n()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              {language === 'uz' ? 'Xodimlar' : 'Workers'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'uz'
              ? "Oylik ish haqi va to'lov tarixi"
              : 'Monthly salaries and payment history'}
          </p>
        </div>

        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-2xl" onClick={onNewWorker}>
              <Plus className="mr-2 h-4 w-4" />
              {language === 'uz' ? 'Yangi xodim' : 'New Worker'}
            </Button>
          </div>
        ) : null}
      </div>
      <Separator />
    </div>
  )
}
