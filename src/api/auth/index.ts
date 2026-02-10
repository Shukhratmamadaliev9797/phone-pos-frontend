import { baseApi } from "@/api";
import { setAuth, clearAuth } from "@/store/slices/auth.slice";
import { AUTH } from "@/api/path";

type ApiUser = {
  id: number | string;
  role: "OWNER_ADMIN" | "ADMIN" | "MANAGER" | "CASHIER" | "TECHNICIAN";
  name?: string;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
};

function toAuthUser(user: ApiUser) {
  return {
    id: user.id,
    role: user.role === "OWNER_ADMIN" ? "ADMIN" : user.role,
    name: user.name ?? user.fullName ?? user.username ?? String(user.id),
    email: user.email,
    phone: user.phone,
  } as const;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user with fresh tokens
    me: builder.query<AuthResponse, void>({
      query: () => ({
        url: AUTH.ME,
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setAuth({
              accessToken: data.auth.access_token,
              refreshToken: data.auth.refresh_token,
              user: toAuthUser(data.user as unknown as ApiUser),
            })
          );
        } catch (err) {
          console.error("Me error:", err);
        }
      },
      providesTags: ["AUTH"],
    }),

    // Login
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: AUTH.LOGIN,
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setAuth({
              accessToken: data.auth.access_token,
              refreshToken: data.auth.refresh_token,
              user: toAuthUser(data.user as unknown as ApiUser),
            })
          );
        } catch (err) {
          console.error("Login error:", err);
        }
      },
      invalidatesTags: ["AUTH"],
    }),

    // Logout
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: AUTH.LOGOUT,
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearAuth());
        } catch (err) {
          // Even if backend call fails, clear local state
          dispatch(clearAuth());
          console.error("Logout error:", err);
        }
      },
      invalidatesTags: ["AUTH"],
    }),

    // Refresh token
    refresh: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: (body) => ({
        url: AUTH.REFRESH,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useMeQuery,
  useLazyMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
} = authApi;
