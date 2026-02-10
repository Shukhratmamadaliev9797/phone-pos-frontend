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
    },
    clearAuth: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.accessToken = null
      state.refreshToken = null
    },
  },
})

export const { setAuth, updateTokens, clearAuth } = authSlice.actions
export default authSlice.reducer
