import type { AxiosError } from 'axios'
import api from '@/lib/api'

export type WorkerRole = 'MANAGER' | 'CASHIER' | 'TECHNICIAN' | 'OTHER'
export type WorkerLoginRole = 'OWNER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'TECHNICIAN'

export type WorkerView = {
  id: number
  fullName: string
  phoneNumber: string
  address?: string | null
  monthlySalary: string
  workerRole: WorkerRole
  hasDashboardAccess: boolean
  userId?: number | null
  loginEmail?: string | null
  notes?: string | null
}

export type SalaryPaymentView = {
  id: number
  workerId: number
  month: string
  amountPaid: string
  paidAt: string
  notes?: string | null
}

export type WorkerDetailsView = WorkerView & {
  payments: SalaryPaymentView[]
  totalPaidThisMonth?: string
  lastPaymentAt?: string | null
}

export type WorkersListParams = {
  page?: number
  limit?: number
  search?: string
  workerRole?: WorkerRole
  hasDashboardAccess?: boolean
}

export type WorkersListResponse = {
  data: WorkerView[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type SalaryPaymentListParams = {
  page?: number
  limit?: number
  fromMonth?: string
  toMonth?: string
}

export type SalaryPaymentListResponse = {
  data: SalaryPaymentView[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type CreateWorkerPayload = {
  fullName: string
  phoneNumber: string
  address?: string
  monthlySalary: number
  workerRole: WorkerRole
  hasDashboardAccess?: boolean
  login?: {
    email: string
    password: string
    role?: WorkerLoginRole
  }
  notes?: string
}

export type UpdateWorkerPayload = {
  fullName?: string
  phoneNumber?: string
  address?: string
  monthlySalary?: number
  workerRole?: WorkerRole
  hasDashboardAccess?: boolean
  login?: {
    email?: string
    password?: string
    role?: WorkerLoginRole
  }
  notes?: string
}

export type AddSalaryPaymentPayload = {
  month: string
  amountPaid: number
  paidAt?: string
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

export async function listWorkers(params: WorkersListParams): Promise<WorkersListResponse> {
  return request(() => api.get('/api/workers', { params }))
}

export async function getWorker(id: number): Promise<WorkerDetailsView> {
  return request(() => api.get(`/api/workers/${id}`))
}

export async function createWorker(body: CreateWorkerPayload): Promise<WorkerView> {
  return request(() => api.post('/api/workers', body))
}

export async function updateWorker(
  id: number,
  body: UpdateWorkerPayload,
): Promise<WorkerView> {
  return request(() => api.patch(`/api/workers/${id}`, body))
}

export async function addSalaryPayment(
  workerId: number,
  body: AddSalaryPaymentPayload,
): Promise<SalaryPaymentView> {
  return request(() => api.post(`/api/workers/${workerId}/salary-payments`, body))
}

export async function listSalaryPayments(
  workerId: number,
  params: SalaryPaymentListParams,
): Promise<SalaryPaymentListResponse> {
  return request(() => api.get(`/api/workers/${workerId}/salary-payments`, { params }))
}

export async function deleteWorker(id: number): Promise<{ success: true }> {
  return request(() => api.delete(`/api/workers/${id}`))
}
