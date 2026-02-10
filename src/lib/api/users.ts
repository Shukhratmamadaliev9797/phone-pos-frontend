import type { AxiosError } from 'axios'
import api from '@/lib/api'

export type UserResponse = {
  id: number
  username: string
  fullName: string
  email?: string | null
  phoneNumber?: string | null
  address?: string | null
  role: 'OWNER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'TECHNICIAN'
}

export type UpdateUserPayload = {
  email?: string
  password?: string
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

export async function updateUserById(
  id: number,
  body: UpdateUserPayload,
): Promise<UserResponse> {
  return request(() => api.patch(`/api/users/${id}`, body))
}
