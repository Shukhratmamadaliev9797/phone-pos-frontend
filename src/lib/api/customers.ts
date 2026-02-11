import type { AxiosError } from 'axios'
import api from '@/lib/api'

export type CustomerBalanceType = 'all' | 'debt' | 'credit'

export type CustomerView = {
  id: number
  fullName: string
  phoneNumber: string
  address?: string | null
  passportId?: string | null
  notes?: string | null
}

export type CustomerBalanceRow = {
  customer: CustomerView
  debt: number
  credit: number
  lastActivityAt?: string | null
  lastPaymentAt?: string | null
  lastPaymentAmount?: number
  soldPhones?: string | null
  purchasedPhones?: string | null
  totalDue: number
}

export type CustomerActivity = {
  type: 'SALE_PAYMENT' | 'PURCHASE_PAYMENT'
  paidAt: string
  amount: number
  notes?: string | null
}

export type CustomerTransactionPhone = {
  brand: string
  model: string
  imei: string
  storage?: string | null
  condition: string
  status: string
}

export type CustomerDetail = {
  customer: CustomerView
  debt: number
  credit: number
  totalDue: number
  soldPhones?: string | null
  purchasedPhones?: string | null
  lastActivityAt?: string | null
  lastPaymentAt?: string | null
  lastPaymentAmount?: number
  activities: CustomerActivity[]
  openSales: Array<{
    id: number
    total?: number
    paid?: number
    remaining: number
    paymentType?: string
    soldAt: string
    phones?: CustomerTransactionPhone[]
  }>
  openPurchases: Array<{
    id: number
    total?: number
    paid?: number
    remaining: number
    paymentType?: string
    purchasedAt: string
    phones?: CustomerTransactionPhone[]
  }>
}

export type CustomerBalancesParams = {
  page?: number
  limit?: number
  search?: string
  type?: CustomerBalanceType
}

export type CustomerBalancesResponse = {
  data: CustomerBalanceRow[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type UpdateCustomerPayload = {
  fullName?: string
  address?: string
  passportId?: string
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

  if (status === 401) return new ApiRequestError('Unauthorized', 401)
  if (status === 403) return new ApiRequestError('Forbidden', 403)

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

export async function listCustomerBalances(
  params: CustomerBalancesParams,
): Promise<CustomerBalancesResponse> {
  return request(() => api.get('/api/customers/balances', { params }))
}

export async function getCustomer(id: number): Promise<CustomerView> {
  return request(() => api.get(`/api/customers/${id}`))
}

export async function getCustomerDetail(id: number): Promise<CustomerDetail> {
  return request(() => api.get(`/api/customers/${id}/details`))
}

export async function updateCustomer(
  id: number,
  body: UpdateCustomerPayload,
): Promise<CustomerView> {
  return request(() => api.patch(`/api/customers/${id}`, body))
}
