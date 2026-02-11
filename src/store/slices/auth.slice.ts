import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type AuthRole =
  | 'OWNER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'CASHIER'
  | 'TECHNICIAN'

export interface AuthUser {
  id: number | string
  name: string
  role: AuthRole
  email?: string
  phone?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
}

function persistAuthToStorage(payload: {
  accessToken: string
  refreshToken?: string
  user: AuthUser
}) {
  localStorage.setItem('access_token', payload.accessToken)
  if (payload.refreshToken) {
    localStorage.setItem('refresh_token', payload.refreshToken)
  } else {
    localStorage.removeItem('refresh_token')
  }
  localStorage.setItem('user', JSON.stringify(payload.user))
}

function persistTokensToStorage(payload: {
  accessToken: string
  refreshToken?: string
}) {
  localStorage.setItem('access_token', payload.accessToken)
  if (payload.refreshToken !== undefined) {
    if (payload.refreshToken) {
      localStorage.setItem('refresh_token', payload.refreshToken)
    } else {
      localStorage.removeItem('refresh_token')
    }
  }
}

function clearAuthFromStorage() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
}

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

const initialAccessToken = localStorage.getItem('access_token')
const initialRefreshToken = localStorage.getItem('refresh_token')
const initialUser = readStoredUser()

const initialState: AuthState = {
  isAuthenticated: Boolean(initialAccessToken && initialUser),
  user: initialUser,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{
        user: AuthUser
        accessToken: string
        refreshToken?: string
      }>
    ) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken ?? null
      state.isAuthenticated = true
      persistAuthToStorage(action.payload)
    },
    updateTokens: (
      state,
      action: PayloadAction<{
        accessToken: string
        refreshToken?: string
      }>
    ) => {
      state.accessToken = action.payload.accessToken
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken
      }
      persistTokensToStorage(action.payload)
    },
    clearAuth: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      clearAuthFromStorage()
    },
  },
})

export const { setAuth, updateTokens, clearAuth } = authSlice.actions
export default authSlice.reducer
