import api from '@/lib/api'
import type { AuthUser } from '@/store/slices/auth.slice'

export type LoginRole = 'ADMIN' | 'CASHIER' | 'TECHNICIAN'

type RawUser = {
  id: number | string
  name?: string
  fullName?: string
  username?: string
  role: 'OWNER_ADMIN' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'TECHNICIAN'
  email?: string
  phone?: string
}

type LoginResult = {
  access_token: string
  refresh_token?: string
  user: AuthUser
}

type WrappedLoginResponse = {
  auth: {
    access_token: string
    refresh_token?: string
  }
  user: RawUser
}

type TokensWrappedResponse = {
  tokens: {
    accessToken: string
    refreshToken?: string
  }
  user: RawUser
}

type StoredAuth = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
}

function normalizeRole(role: RawUser['role']): AuthUser['role'] {
  if (role === 'OWNER_ADMIN') {
    return 'ADMIN'
  }
  return role
}

function normalizeUser(user: RawUser): AuthUser {
  return {
    id: user.id,
    name: user.name ?? user.fullName ?? user.username ?? String(user.id),
    role: normalizeRole(user.role),
    email: user.email,
    phone: user.phone,
  }
}

export async function login(
  identifier: string,
  password: string,
  role: LoginRole
): Promise<LoginResult> {
  const { data } = await api.post<
    LoginResult | WrappedLoginResponse | TokensWrappedResponse
  >('/api/auth/login', {
    identifier,
    password,
    role,
  })

  if ('auth' in data) {
    return {
      access_token: data.auth.access_token,
      refresh_token: data.auth.refresh_token,
      user: normalizeUser(data.user),
    }
  }

  if ('tokens' in data) {
    return {
      access_token: data.tokens.accessToken,
      refresh_token: data.tokens.refreshToken,
      user: normalizeUser(data.user),
    }
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: normalizeUser(data.user),
  }
}

export function logout() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

export function getStoredAuth(): StoredAuth {
  const accessToken = localStorage.getItem('access_token')
  const refreshToken = localStorage.getItem('refresh_token')
  const rawUser = localStorage.getItem('user')

  let user: AuthUser | null = null
  if (rawUser) {
    try {
      user = normalizeUser(JSON.parse(rawUser) as RawUser)
    } catch {
      user = null
    }
  }

  return {
    accessToken,
    refreshToken,
    user,
  }
}
