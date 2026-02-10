import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
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
    <Card className="rounded-3xl">
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xl font-semibold">
              {language === 'uz' ? 'Xodimlar' : 'Workers'}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {language === 'uz'
                ? "Oylik ish haqi va to'lov tarixi"
                : 'Monthly salaries and payment history'}
            </div>
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
      </CardContent>
    </Card>
  )
}
