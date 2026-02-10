import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import type { WorkerRow } from './workers-table'
import { useI18n } from '@/lib/i18n/provider'

function money(n: number) {
  return `${Math.max(0, Math.round(n)).toLocaleString('en-US')} so'm`
}

export function WorkersKpiRow({ rows }: { rows: WorkerRow[] }) {
  const { language } = useI18n()
  const kpi = React.useMemo(() => {
    const count = rows.length
    const totalPayroll = rows.reduce((a, r) => a + r.monthlySalary, 0)
    const paid = rows.reduce((a, r) => a + r.monthPaid, 0)
    const remaining = rows.reduce((a, r) => a + r.monthRemaining, 0)
    const withAccess = rows.filter((row) => row.hasDashboardAccess).length
    return { count, totalPayroll, paid, remaining, withAccess }
  }, [rows])

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <Kpi label={language === 'uz' ? 'Xodimlar' : 'Workers'} value={`${kpi.count}`} />
      <Kpi label={language === 'uz' ? "Jami oylik fondi" : 'Total payroll'} value={money(kpi.totalPayroll)} />
      <Kpi label={language === 'uz' ? "Shu oy to'langan" : 'Paid this month'} value={money(kpi.paid)} />
      <Kpi label={language === 'uz' ? 'Qolgan' : 'Pending'} value={money(kpi.remaining)} />
      <Kpi label={language === 'uz' ? 'Dashboard ruxsati' : 'Dashboard access'} value={`${kpi.withAccess}`} />
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-3xl border-muted/40 bg-muted/30">
      <CardContent className="pr-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="mt-2 text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}
