import type { AxiosError } from 'axios'
import api from '@/lib/api'

export type RepairCaseStatus = 'PENDING' | 'DONE' | 'CANCELLED' | 'OPEN'

export type RepairListParams = {
  page?: number
  limit?: number
  status?: string
  technicianId?: number
  search?: string
}

export type RepairInventoryItem = {
  id: number
  imei: string
  brand: string
  model: string
  status: 'IN_STOCK' | 'IN_REPAIR' | 'READY_FOR_SALE' | 'SOLD' | 'RETURNED'
  condition?: 'GOOD' | 'USED' | 'BROKEN'
}

export type RepairEntry = {
  id: number
  entryAt?: string
  repairedAt?: string
  description: string
  costTotal: string | number
  partsCost?: string | number | null
  laborCost?: string | number | null
  notes?: string | null
}

export type RepairListItem = {
  id: number
  repairedAt?: string
  createdAt?: string
  description?: string
  status: RepairCaseStatus
  costTotal: string | number
  partsCost?: string | number | null
  laborCost?: string | number | null
  notes?: string | null
  technicianId?: number | null
  technician?: {
    id: number
    fullName?: string
    username?: string
  } | null
  item?: {
    id: number
    imei?: string
    brand?: string
    model?: string
    storage?: string | null
    color?: string | null
    serialNumber?: string | null
    condition?: 'GOOD' | 'USED' | 'BROKEN'
    status?: string
    knownIssues?: string | null
  } | null
  itemId?: number
}

export type RepairDetail = RepairListItem & {
  entries?: RepairEntry[]
  totalRepairSpent?: string | number
  totalCost?: string | number
}

export type RepairListResponse = {
  data: RepairListItem[]
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type CreateRepairCasePayload = {
  itemId?: number
  imei?: string
  description?: string
  notes?: string
  status?: 'PENDING' | 'DONE'
  technicianId?: number
  assignedTechnicianId?: number
  repairedAt?: string
  costTotal?: number
  partsCost?: number
  laborCost?: number
}

export type UpdateRepairCasePayload = {
  notes?: string
  status?: 'PENDING' | 'DONE'
  technicianId?: number | null
  assignedTechnicianId?: number | null
  description?: string
  repairedAt?: string
  costTotal?: number
  partsCost?: number
  laborCost?: number
}

export type AddRepairEntryPayload = {
  description: string
  costTotal: number
  partsCost?: number
  laborCost?: number
  notes?: string
  entryAt?: string
}

export type UpdateRepairEntryPayload = Partial<AddRepairEntryPayload>

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

export async function listRepairs(params: RepairListParams): Promise<RepairListResponse> {
  const payload = await request(() => api.get('/api/repairs', { params }))

  if (Array.isArray(payload)) {
    return { data: payload as RepairListItem[] }
  }

  return payload as RepairListResponse
}

export async function getRepairCase(id: number): Promise<RepairDetail> {
  return request(() => api.get(`/api/repairs/${id}`))
}

export async function createRepairCase(body: CreateRepairCasePayload): Promise<RepairDetail> {
  return request(() => api.post('/api/repairs/cases', body))
}

export async function updateRepairCase(
  id: number,
  body: UpdateRepairCasePayload,
): Promise<RepairDetail> {
  return request(() => api.patch(`/api/repairs/cases/${id}`, body))
}

export async function addRepairEntry(
  caseId: number,
  body: AddRepairEntryPayload,
): Promise<RepairDetail> {
  return request(() => api.post(`/api/repairs/cases/${caseId}/entries`, body))
}

export async function updateRepairEntry(
  entryId: number,
  body: UpdateRepairEntryPayload,
): Promise<RepairDetail> {
  return request(() => api.patch(`/api/repairs/entries/${entryId}`, body))
}

export async function deleteRepairEntry(entryId: number): Promise<RepairDetail> {
  return request(() => api.delete(`/api/repairs/entries/${entryId}`))
}

export async function listRepairableInventory(params?: {
  search?: string
  includeReadyForSale?: boolean
}): Promise<RepairInventoryItem[]> {
  try {
    const payload = await request(() =>
      api.get('/api/repairs/available-items', {
        params: {
          q: params?.search,
        },
      }),
    )

    const items = (Array.isArray(payload)
      ? payload
      : ((payload as { data?: RepairInventoryItem[] }).data ?? [])) as RepairInventoryItem[]
    return items.filter((item) => item.status === 'IN_STOCK' || item.status === 'READY_FOR_SALE')
  } catch {
    const fallback = await request(() =>
      api.get('/api/sales/available-items', {
        params: {
          q: params?.search,
        },
      }),
    )

    const items = (Array.isArray(fallback) ? fallback : []) as Array<{
      id: number
      imei: string
      brand: string
      model: string
      status: RepairInventoryItem['status']
      condition?: RepairInventoryItem['condition']
    }>

    return items
      .filter((item) => item.status === 'IN_STOCK' || item.status === 'READY_FOR_SALE')
      .map((item) => ({
        id: item.id,
        imei: item.imei,
        brand: item.brand,
        model: item.model,
        status: item.status,
        condition: item.condition,
      }))
  }
}
