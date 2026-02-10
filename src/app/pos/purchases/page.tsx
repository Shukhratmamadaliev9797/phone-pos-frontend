import { useCallback, useEffect, useMemo, useState } from 'react'
import { PurchasesFilters } from './components/purchases-filter'
import { PurchasesPageHeader } from './components/purchases-header'
import { PurchasesTable } from './components/purchases-table'
import { NewPurchaseModal } from './modals/new-purchase-modal'
import { EditPurchaseModal } from './modals/edit-purchase-modal'
import { PurchaseDetailsModal } from './modals/purchase-details-modal'
import { AddPurchasePaymentModal } from './modals/add-payment-modal'
import { useAppSelector } from '@/store/hooks'
import {
  addPurchasePayment,
  ApiRequestError,
  createPurchase,
  deletePurchase,
  getPurchase,
  listPurchases,
  PURCHASE_DELETE_SUPPORTED,
  type CreatePurchasePayload,
  type PurchaseDetail,
  type PurchaseListItem,
  type PurchasePaymentType,
  type UpdatePurchasePayload,
  updatePurchase,
} from '@/lib/api/purchases'
import { canManagePurchases } from '@/lib/auth/permissions'

const PAGE_LIMIT = 10

export default function PurchasesPage() {
  const currentRole = useAppSelector((state) => state.auth.user?.role)
  const canManage = canManagePurchases(currentRole)

  const [rows, setRows] = useState<PurchaseListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [paymentType, setPaymentType] = useState<'all' | PurchasePaymentType>('all')
  const [paymentMethod, setPaymentMethod] = useState<'all' | 'CASH' | 'CARD' | 'OTHER'>('all')
  const [status, setStatus] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all')
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const [openNew, setOpenNew] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openDetails, setOpenDetails] = useState(false)
  const [openPayment, setOpenPayment] = useState(false)

  const [selectedListRow, setSelectedListRow] = useState<PurchaseListItem | null>(null)
  const [selectedDetail, setSelectedDetail] = useState<PurchaseDetail | null>(null)

  const canDelete =
    (currentRole === 'OWNER_ADMIN' || currentRole === 'ADMIN') &&
    PURCHASE_DELETE_SUPPORTED

  const computedServerDateRange = useMemo(() => {
    const now = new Date()
    if (dateRange === 'today') {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      return {
        from: start.toISOString(),
        to: now.toISOString(),
      }
    }
    if (dateRange === 'week') {
      const start = new Date(now)
      start.setDate(now.getDate() - 7)
      return {
        from: start.toISOString(),
        to: now.toISOString(),
      }
    }
    if (dateRange === 'month') {
      const start = new Date(now)
      start.setMonth(now.getMonth() - 1)
      return {
        from: start.toISOString(),
        to: now.toISOString(),
      }
    }
    if (dateRange === 'custom') {
      return {
        from: customFrom ? new Date(customFrom).toISOString() : undefined,
        to: customTo ? new Date(customTo).toISOString() : undefined,
      }
    }
    return {
      from: undefined,
      to: undefined,
    }
  }, [dateRange, customFrom, customTo])

  const pushToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
  }, [])

  useEffect(() => {
    if (!toast) return

    setToastVisible(false)
    const enterTimer = window.setTimeout(() => setToastVisible(true), 20)
    const leaveTimer = window.setTimeout(() => setToastVisible(false), 2400)
    const removeTimer = window.setTimeout(() => setToast(null), 2750)

    return () => {
      window.clearTimeout(enterTimer)
      window.clearTimeout(leaveTimer)
      window.clearTimeout(removeTimer)
    }
  }, [toast])

  const loadList = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await listPurchases({
        page,
        limit: PAGE_LIMIT,
        from: computedServerDateRange.from,
        to: computedServerDateRange.to,
        paymentType: paymentType === 'all' ? undefined : paymentType,
      })
      setRows(response.data)
      setTotal(response.meta.total)
      setTotalPages(response.meta.totalPages)
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.status === 401) {
        setError('Session expired. Please continue using the app; token refresh will retry automatically.')
        pushToast('error', 'Session expired. Please sign in again if actions fail.')
        return
      }
      setError(requestError instanceof Error ? requestError.message : 'Failed to load purchases')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [page, computedServerDateRange.from, computedServerDateRange.to, paymentType])

  useEffect(() => {
    loadList()
  }, [loadList])

  useEffect(() => {
    if (!canManage) {
      setOpenNew(false)
      setOpenEdit(false)
    }
  }, [canManage])

  function blockActionForViewer(): boolean {
    if (canManage) return false
    window.alert('Not allowed')
    return true
  }

  async function handleOpenDetails(row: PurchaseListItem) {
    try {
      const detail = await getPurchase(row.id)
      setSelectedListRow(row)
      setSelectedDetail(detail)
      setOpenDetails(true)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to load purchase details'
      pushToast('error', message)
    }
  }

  async function handleOpenEdit(row: PurchaseListItem) {
    if (blockActionForViewer()) return

    try {
      const detail = await getPurchase(row.id)
      setSelectedListRow(row)
      setSelectedDetail(detail)
      setOpenEdit(true)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to load purchase details'
      pushToast('error', message)
    }
  }

  async function handleCreate(payload: CreatePurchasePayload) {
    if (blockActionForViewer()) return

    await createPurchase(payload)
    pushToast('success', 'Purchase created successfully')
    await loadList()
  }

  async function handleUpdate(id: number, payload: UpdatePurchasePayload) {
    if (blockActionForViewer()) return

    const detail = await updatePurchase(id, payload)
    setSelectedDetail(detail)
    pushToast('success', 'Purchase updated successfully')
    await loadList()
  }

  async function handleDelete(row: PurchaseListItem) {
    if (blockActionForViewer()) return
    if (!canDelete) return

    const confirmed = window.confirm(`Delete purchase #${row.id}?`)
    if (!confirmed) return

    await deletePurchase(row.id)
    pushToast('success', 'Purchase deleted successfully')
    await loadList()
  }

  async function handleAddPayment(id: number, amount: number) {
    if (blockActionForViewer()) return
    const detail = await addPurchasePayment(id, { amount })
    setSelectedDetail(detail)
    pushToast('success', 'Payment added successfully')
    await loadList()
  }

  const headerCanCreate = useMemo(() => canManage, [canManage])
  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (paymentMethod !== 'all' && row.paymentMethod !== paymentMethod) {
        return false
      }

      if (status !== 'all') {
        const remaining = Number(row.remaining)
        const totalPrice = Number(row.totalPrice)
        const currentStatus =
          remaining <= 0
            ? 'paid'
            : remaining >= totalPrice
              ? 'unpaid'
              : 'partial'
        if (currentStatus !== status) {
          return false
        }
      }

      if (!normalizedSearch) {
        return true
      }

      const haystack = [
        String(row.id),
        row.customer?.fullName ?? '',
        row.customer?.phoneNumber ?? '',
        row.phoneLabel ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [rows, paymentMethod, status, search])
  const hasClientSideFilters = Boolean(
    search.trim() || paymentMethod !== 'all' || status !== 'all',
  )
  const totalForTable = hasClientSideFilters ? filteredRows.length : total

  return (
    <div className="space-y-6">
      <PurchasesPageHeader
        canCreate={headerCanCreate}
        onNewPurchase={() => {
          if (blockActionForViewer()) return
          setOpenNew(true)
        }}
      />

      <PurchasesFilters
        search={search}
        dateRange={dateRange}
        paymentType={paymentType}
        paymentMethod={paymentMethod}
        status={status}
        customFrom={customFrom}
        customTo={customTo}
        onSearchChange={(value) => setSearch(value)}
        onDateRangeChange={(value) => {
          setPage(1)
          setDateRange(value)
        }}
        onPaymentTypeChange={(value) => {
          setPage(1)
          setPaymentType(value)
        }}
        onPaymentMethodChange={(value) => setPaymentMethod(value)}
        onStatusChange={(value) => setStatus(value)}
        onCustomFromChange={(value) => {
          setPage(1)
          setCustomFrom(value)
        }}
        onCustomToChange={(value) => {
          setPage(1)
          setCustomTo(value)
        }}
        onReset={() => {
          setPage(1)
          setSearch('')
          setDateRange('all')
          setCustomFrom('')
          setCustomTo('')
          setPaymentType('all')
          setPaymentMethod('all')
          setStatus('all')
        }}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <PurchasesTable
        rows={filteredRows}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={totalForTable}
        canManage={canManage}
        canDelete={canDelete}
        onPageChange={setPage}
        onView={handleOpenDetails}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      <NewPurchaseModal
        open={openNew}
        onOpenChange={setOpenNew}
        canManage={canManage}
        onSubmit={handleCreate}
      />

      <EditPurchaseModal
        open={openEdit}
        canManage={canManage}
        purchase={selectedDetail}
        onClose={() => setOpenEdit(false)}
        onSubmit={handleUpdate}
      />

      <PurchaseDetailsModal
        open={openDetails}
        onOpenChange={setOpenDetails}
        purchase={selectedDetail}
        canManage={canManage}
        onEdit={(purchase) => {
          if (blockActionForViewer()) return
          setSelectedListRow(rows.find((row) => row.id === purchase.id) ?? selectedListRow)
          setSelectedDetail(purchase)
          setOpenDetails(false)
          setOpenEdit(true)
        }}
        onAddPayment={(purchase) => {
          if (blockActionForViewer()) return
          setSelectedListRow(rows.find((row) => row.id === purchase.id) ?? selectedListRow)
          setSelectedDetail(purchase)
          setOpenDetails(false)
          setOpenPayment(true)
        }}
      />

      <AddPurchasePaymentModal
        open={openPayment}
        onOpenChange={setOpenPayment}
        purchase={selectedDetail}
        onSubmit={handleAddPayment}
      />

      {toast ? (
        <div
          className={`fixed right-5 top-5 z-[90] transition-all duration-300 ease-out ${
            toastVisible
              ? 'translate-x-0 opacity-100'
              : 'translate-x-[120%] opacity-0'
          }`}
        >
          <div
            className={`rounded-xl px-4 py-3 text-sm text-white shadow-lg ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </div>
  )
}
