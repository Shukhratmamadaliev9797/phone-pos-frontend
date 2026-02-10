import axios from 'axios'
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

type RetryableRequestConfig = AxiosRequestConfig & {
  _retry?: boolean
}

type RefreshResponse =
  | {
      tokens?: { accessToken?: string; refreshToken?: string }
      user?: unknown
    }
  | {
      auth?: { access_token?: string; refresh_token?: string }
      user?: unknown
    }
  | {
      access_token?: string
      refresh_token?: string
      user?: unknown
    }

let refreshPromise: Promise<string | null> | null = null

function extractAccessToken(payload: RefreshResponse): string | null {
  if ('tokens' in payload && payload.tokens?.accessToken) {
    return payload.tokens.accessToken
  }
  if ('auth' in payload && payload.auth?.access_token) {
    return payload.auth.access_token
  }
  if ('access_token' in payload && payload.access_token) {
    return payload.access_token
  }
  return null
}

function extractRefreshToken(payload: RefreshResponse): string | null {
  if ('tokens' in payload && payload.tokens?.refreshToken) {
    return payload.tokens.refreshToken
  }
  if ('auth' in payload && payload.auth?.refresh_token) {
    return payload.auth.refresh_token
  }
  if ('refresh_token' in payload && payload.refresh_token) {
    return payload.refresh_token
  }
  return null
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refresh_token')
  if (!refreshToken) {
    return null
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<RefreshResponse>(
        `${api.defaults.baseURL ?? ''}/api/auth/refresh`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      )
      .then(({ data }) => {
        const nextAccessToken = extractAccessToken(data)
        const nextRefreshToken = extractRefreshToken(data)

        if (!nextAccessToken) {
          return null
        }

        localStorage.setItem('access_token', nextAccessToken)
        if (nextRefreshToken) {
          localStorage.setItem('refresh_token', nextRefreshToken)
        }
        if ('user' in data && data.user) {
          localStorage.setItem('user', JSON.stringify(data.user))
        }

        return nextAccessToken
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined
    const status = error.response?.status

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true
    const nextAccessToken = await refreshAccessToken()

    if (!nextAccessToken) {
      return Promise.reject(error)
    }

    originalRequest.headers = {
      ...(originalRequest.headers ?? {}),
      Authorization: `Bearer ${nextAccessToken}`,
    }

    return api.request(originalRequest)
  },
)

export default api
