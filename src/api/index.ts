import { clearAuth, updateTokens } from '@/store/slices/auth.slice'
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { RootState } from '@/store'
import { AUTH } from './path'

const url = import.meta.env.VITE_BASE_URL

const baseQuery = fetchBaseQuery({
  baseUrl: `${url}`,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (token) headers.set('Authorization', `Bearer ${token}`)
    return headers
  },
})

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  // If we get 401 and it's not the refresh endpoint itself
  if (result.error?.status === 401) {
    const state = api.getState() as RootState
    const refreshToken = state.auth.refreshToken

    if (refreshToken) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        {
          url: AUTH.REFRESH,
          method: 'POST',
          body: {
            refresh_token: refreshToken,
          },
        },
        api,
        extraOptions
      )

      const refreshData = refreshResult?.data as AuthResponse | undefined

      if (refreshData?.auth?.access_token && refreshData?.auth?.refresh_token) {
        // Update tokens in store
        api.dispatch(
          updateTokens({
            accessToken: refreshData.auth.access_token,
            refreshToken: refreshData.auth.refresh_token,
          })
        )

        // Retry the original request with new token
        result = await baseQuery(args, api, extraOptions)
      } else {
        // Refresh failed, logout user
        api.dispatch(clearAuth())
      }
    } else {
      // No refresh token, logout user
      api.dispatch(clearAuth())
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['AUTH', 'USERS'],
  keepUnusedDataFor: 30,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
})
