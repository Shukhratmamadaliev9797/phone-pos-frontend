import type { AxiosError } from 'axios'
import api from '@/lib/api'

export type SupportRequestView = {
  id: number
  senderUserId: number | null
  senderFullName: string
  senderRole: 'OWNER_ADMIN' | 'MANAGER' | 'CASHIER' | 'TECHNICIAN'
  message: string
  createdAt: string
  isRead: boolean
  readAt: string | null
  readByAdminId: number | null
}

export type CreateSupportRequestPayload = {
  message: string
}

export type SupportRequestsListParams = {
  page?: number
  limit?: number
  search?: string
  createdDate?: string
  status?: 'all' | 'read' | 'unread'
}

export type SupportRequestsListResponse = {
  data: SupportRequestView[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
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
  const payload = axiosError.response?.data?.message
  const message = Array.isArray(payload) ? payload.join(', ') : payload

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

export async function createSupportRequest(
  body: CreateSupportRequestPayload,
): Promise<SupportRequestView> {
  return request(() => api.post('/api/support-requests', body))
}

export async function listSupportRequests(
  params: SupportRequestsListParams = {},
): Promise<SupportRequestsListResponse> {
  return request(() => api.get('/api/support-requests', { params }))
}

export async function updateSupportRequestStatus(
  id: number,
  isRead: boolean,
): Promise<SupportRequestView> {
  return request(() =>
    api.patch(`/api/support-requests/${id}/status`, {
      isRead,
    }),
  )
}
