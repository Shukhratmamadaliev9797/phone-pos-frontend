export const AUTH = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
} as const

export const USERS = {
  GET: '/users',
  GET_BY_ID: '/users/:id',
  POST: '/users',
  PATCH: '/users/:id',
  DELETE: '/users/:id',
} as const
