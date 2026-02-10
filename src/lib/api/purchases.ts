import type { AxiosError } from 'axios'
import api from '@/lib/api'

export type PurchasePaymentMethod = 'CASH' | 'CARD' | 'OTHER'
export type PurchasePaymentType = 'PAID_NOW' | 'PAY_LATER'
export type InventoryCondition = 'GOOD' | 'USED' | 'BROKEN'
export type InventoryStatus = 'IN_STOCK' | 'IN_REPAIR'

export type PurchaseListParams = {
  page?: number
  limit?: number
  from?: string
  to?: string
  customerId?: number
  paymentType?: PurchasePaymentType
}

export type CreatePurchaseItemPayload = {
  imei: string
  serialNumber?: string
  brand: string
  model: string
  storage?: string
  color?: string
  condition: InventoryCondition
  knownIssues?: string
  purchasePrice: number
  initialStatus?: InventoryStatus
}

export type CreatePurchasePayload = {
  purchasedAt?: string
  customerId?: number
  customer?: {
    fullName: string
    phoneNumber: string
    address?: string
    passportId?: string
    notes?: string
  }
  paymentMethod: PurchasePaymentMethod
  paymentType: PurchasePaymentType
  paidNow?: number
  notes?: string
  items: CreatePurchaseItemPayload[]
}

export type UpdatePurchasePayload = {
  purchasedAt?: string
  customerId?: number
  customer?: {
    fullName?: string
    phoneNumber?: string
    address?: string
  }
  paymentMethod?: PurchasePaymentMethod
  paymentType?: PurchasePaymentType
  paidNow?: number
  notes?: string
  items?: Array<{
    itemId?: number
    imei: string
    serialNumber?: string
    brand: string
    model: string
    storage?: string
    color?: string
    condition: InventoryCondition
    knownIssues?: string
    initialStatus?: 'IN_STOCK' | 'IN_REPAIR'
    purchasePrice: number
  }>
}

export type PurchaseListItem = {
  id: number
  purchasedAt: string
  customerId?: number | null
  customer?: {
    id: number
    fullName: string
    phoneNumber: string
    address?: string | null
  } | null
  paymentMethod: PurchasePaymentMethod
  paymentType: PurchasePaymentType
  totalPrice: string
  paidNow: string
  remaining: string
  notes?: string | null
  itemsCount: number
  phoneLabel?: string | null
  phoneStatus?: 'IN_STOCK' | 'IN_REPAIR' | 'READY_FOR_SALE' | 'SOLD' | 'RETURNED' | null
}

export type PurchaseListResponse = {
  data: PurchaseListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type PurchaseDetailItem = {
  id: number
  itemId: number
  purchasePrice: string
  notes?: string | null
  item: {
    imei: string
    serialNumber?: string | null
    brand: string
    model: string
    storage?: string | null
    color?: string | null
    status: 'IN_STOCK' | 'IN_REPAIR' | 'READY_FOR_SALE' | 'SOLD' | 'RETURNED'
    condition: InventoryCondition
    knownIssues?: string | null
  }
}

export type PurchaseDetail = Omit<PurchaseListItem, 'itemsCount'> & {
  items: PurchaseDetailItem[]
  activities: PurchasePaymentActivity[]
  customer?: {
    id: number
    fullName: string
    phoneNumber: string
    address?: string | null
  } | null
}

export type PurchasePaymentActivity = {
  id: number
  paidAt: string
  amount: string
  notes?: string | null
}

export type AddPurchasePaymentPayload = {
  amount: number
  notes?: string
}

export class ApiRequestError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
  }
}

function normalizeApiError(error: unknown): ApiRequestError {
  const axiosError = error as AxiosError<{ message?: string | string[] }>
  const status = axiosError.response?.status

  if (status === 401) {
    return new ApiRequestError('Unauthorized', 401)
  }

  const messagePayload = axiosError.response?.data?.message
  const message = Array.isArray(messagePayload)
    ? messagePayload.join(', ')
    : messagePayload

  return new ApiRequestError(message || axiosError.message || 'Request failed', status)
}

async function request<T>(call: () => Promise<{ data: T }>): Promise<T> {
  try {
    const response = await call()
    return response.data
  } catch (error) {
    throw normalizeApiError(error)
  }
}

export async function listPurchases(params: PurchaseListParams): Promise<PurchaseListResponse> {
  return request(() => api.get('/api/purchases', { params }))
}

export async function getPurchase(id: number): Promise<PurchaseDetail> {
  return request(() => api.get(`/api/purchases/${id}`))
}

export async function createPurchase(body: CreatePurchasePayload): Promise<PurchaseDetail> {
  return request(() => api.post('/api/purchases', body))
}

export async function updatePurchase(
  id: number,
  body: UpdatePurchasePayload,
): Promise<PurchaseDetail> {
  return request(() => api.patch(`/api/purchases/${id}`, body))
}

export async function addPurchasePayment(
  id: number,
  body: AddPurchasePaymentPayload,
): Promise<PurchaseDetail> {
  return request(() => api.post(`/api/purchases/${id}/payments`, body))
}

export const PURCHASE_DELETE_SUPPORTED = true

export async function deletePurchase(id: number): Promise<void> {
  await request(() => api.delete(`/api/purchases/${id}`))
}
