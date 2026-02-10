import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus, ShoppingBag } from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'

interface PurchasesPageHeaderProps {
  onNewPurchase?: () => void
  canCreate: boolean
}

export function PurchasesPageHeader({
  onNewPurchase,
  canCreate,
}: PurchasesPageHeaderProps) {
  const { language } = useI18n()
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">
              {language === 'uz' ? 'Xaridlar' : 'Purchases'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'uz'
              ? "Mijozlardan telefon xarid qiling va kreditlarni boshqaring"
              : 'Buy phones from customers and manage credits'}
          </p>
        </div>

        {canCreate ? (
          <Button
            size="sm"
            className="self-start sm:self-auto"
            onClick={onNewPurchase}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">
              {language === 'uz' ? 'Yangi xarid' : 'New Purchase'}
            </span>
          </Button>
        ) : null}
      </div>

      <Separator />
    </div>
  )
}
