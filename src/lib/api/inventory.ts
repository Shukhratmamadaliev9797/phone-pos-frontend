import type { AxiosError } from 'axios'
import api from '@/lib/api'

export type InventoryStatus =
  | 'IN_STOCK'
  | 'IN_REPAIR'
  | 'READY_FOR_SALE'
  | 'SOLD'
  | 'RETURNED'
export type InventoryCondition = 'GOOD' | 'USED' | 'BROKEN'

export type InventoryListParams = {
  page?: number
  limit?: number
  q?: string
  status?: InventoryStatus
  condition?: InventoryCondition
}

export type InventoryListItem = {
  id: number
  itemName: string
  brand: string
  model: string
  imei: string
  serialNumber?: string | null
  purchaseId?: number | null
  saleId?: number | null
  condition: InventoryCondition
  status: InventoryStatus
  cost: number
  purchaseCost: number
  repairCost: number
  expectedSalePrice?: number | null
  knownIssues?: string | null
}

export type InventoryListResponse = {
  data: InventoryListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type UpdateInventoryItemPayload = {
  imei?: string
  serialNumber?: string | null
  brand?: string
  model?: string
  storage?: string | null
  color?: string | null
  condition?: InventoryCondition
  status?: InventoryStatus
  knownIssues?: string | null
  expectedSalePrice?: number | null
}

export type CreateInventoryItemPayload = {
  imei: string
  serialNumber?: string
  brand: string
  model: string
  storage?: string
  color?: string
  condition: InventoryCondition
  status?: InventoryStatus
  knownIssues?: string
  expectedSalePrice: number
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

export async function listInventoryItems(
  params: InventoryListParams = {},
): Promise<InventoryListResponse> {
  return request(() => api.get('/api/inventory-items', { params }))
}

export async function updateInventoryItem(
  id: number,
  body: UpdateInventoryItemPayload,
): Promise<void> {
  await request(() => api.patch(`/api/inventory-items/${id}`, body))
}

export async function createInventoryItem(
  body: CreateInventoryItemPayload,
): Promise<void> {
  await request(() => api.post('/api/inventory-items', body))
}

export async function deleteInventoryItem(id: number): Promise<void> {
  await request(() => api.delete(`/api/inventory-items/${id}`))
}
