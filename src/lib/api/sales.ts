import type { AxiosError } from 'axios'
import api from '@/lib/api'

export type SalePaymentMethod = 'CASH' | 'CARD' | 'OTHER'
export type SalePaymentType = 'PAID_NOW' | 'PAY_LATER'
export type SaleItemStatus = 'IN_STOCK' | 'IN_REPAIR' | 'READY_FOR_SALE' | 'SOLD' | 'RETURNED'
export type SaleItemCondition = 'GOOD' | 'USED' | 'BROKEN'
export type AvailableSaleItem = {
  id: number
  purchaseId: number
  imei: string
  brand: string
  model: string
  condition: SaleItemCondition
  status: SaleItemStatus
  purchasePrice: string
}

export type SaleListParams = {
  page?: number
  limit?: number
  from?: string
  to?: string
  customerId?: number
  paymentType?: SalePaymentType
}

export type SaleListItem = {
  id: number
  soldAt: string
  customerId?: number | null
  customer?: {
    id: number
    fullName: string
    phoneNumber: string
    address?: string | null
  } | null
  paymentMethod: SalePaymentMethod
  paymentType: SalePaymentType
  totalPrice: string
  paidNow: string
  remaining: string
  notes?: string | null
  itemsCount?: number
  phoneLabel?: string | null
}

export type SaleDetailItem = {
  id: number
  itemId: number
  salePrice: string
  notes?: string | null
  item: {
    imei: string
    brand: string
    model: string
    status: SaleItemStatus
    condition: SaleItemCondition
  }
}

export type SaleDetail = Omit<SaleListItem, 'itemsCount' | 'phoneLabel'> & {
  items: SaleDetailItem[]
  activities: SalePaymentActivity[]
}

export type SalePaymentActivity = {
  id: number
  paidAt: string
  amount: string
  notes?: string | null
}

export type SaleListResponse = {
  data: SaleListItem[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type CreateSaleItemPayload = {
  itemId?: number
  imei?: string
  salePrice: number
  notes?: string
}

export type CreateSalePayload = {
  soldAt?: string
  customerId?: number
  customer?: {
    fullName: string
    phoneNumber: string
    address?: string
  }
  paymentMethod: SalePaymentMethod
  paymentType: SalePaymentType
  paidNow?: number
  notes?: string
  items: CreateSaleItemPayload[]
}

export type UpdateSalePayload = {
  soldAt?: string
  customerId?: number
  customer?: {
    fullName?: string
    phoneNumber?: string
    address?: string
  }
  paymentMethod?: SalePaymentMethod
  paymentType?: SalePaymentType
  paidNow?: number
  notes?: string
  items?: Array<{
    itemId?: number
    imei?: string
    salePrice: number
    notes?: string
  }>
}

export type AddSalePaymentPayload = {
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

export async function listSales(params: SaleListParams): Promise<SaleListResponse> {
  const payload = await request(() => api.get('/api/sales', { params }))

  if (Array.isArray(payload)) {
    return { data: payload as SaleListItem[] }
  }

  return payload as SaleListResponse
}

export async function listAvailableSaleItems(params?: { q?: string }): Promise<AvailableSaleItem[]> {
  return request(() => api.get('/api/sales/available-items', { params }))
}

export async function getSale(id: number): Promise<SaleDetail> {
  return request(() => api.get(`/api/sales/${id}`))
}

export async function createSale(body: CreateSalePayload): Promise<SaleDetail> {
  return request(() => api.post('/api/sales', body))
}

export async function updateSale(
  id: number,
  body: UpdateSalePayload,
): Promise<SaleDetail> {
  return request(() => api.patch(`/api/sales/${id}`, body))
}

export async function addSalePayment(
  id: number,
  body: AddSalePaymentPayload,
): Promise<SaleDetail> {
  return request(() => api.post(`/api/sales/${id}/payments`, body))
}

export const SALE_DELETE_SUPPORTED = true

export async function deleteSale(id: number): Promise<void> {
  await request(() => api.delete(`/api/sales/${id}`))
}
