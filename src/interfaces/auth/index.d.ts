// ==== Auth Request Payloads ====
declare interface LoginRequest {
  username: string
  password: string
}

declare interface RefreshTokenRequest {
  refresh_token: string
}

// ==== Auth Response Types ====
declare interface User {
  id: number
  username: string
  role: 'ADMIN' | 'WORKER'
  createdAt: string
  updatedAt: string
}

declare interface AuthTokens {
  access_token: string
  refresh_token: string
}

declare interface AuthResponse {
  user: User
  auth: AuthTokens
}

declare interface LogoutResponse {
  message: string
}
