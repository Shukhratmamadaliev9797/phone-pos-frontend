import { baseApi } from "@/api";
import { setAuth, clearAuth } from "@/store/slices/auth.slice";
import { AUTH } from "@/api/path";
import type { ApiUser } from "../type";

// 🔄 Backend user modelini frontend auth user modeliga moslashtirish
function toAuthUser(user: ApiUser) {
  return {
    id: user.id,

    role: user.role === "OWNER_ADMIN" ? "ADMIN" : user.role,

    name: user.name ?? user.fullName ?? user.username ?? String(user.id),

    email: user.email,
    phone: user.phone,
  } as const;
}

// RTK Query orqali auth endpointlarni inject qilamiz
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query<AuthResponse, void>({
      query: () => ({
        url: AUTH.ME,
        method: "GET",
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          // Backend'dan kelgan token va userni redux auth state ga saqlaymiz
          dispatch(
            setAuth({
              accessToken: data.auth.access_token,
              refreshToken: data.auth.refresh_token,
              user: toAuthUser(data.user as unknown as ApiUser),
            }),
          );
        } catch (err) {
          console.error("Me error:", err);
        }
      },

      providesTags: ["AUTH"], // cache uchun tag
    }),

    // Login endpoint
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: AUTH.LOGIN,
        method: "POST",
        body,
      }),

      // Login muvaffaqiyatli bo‘lsa tokenlarni saqlaymiz
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            setAuth({
              accessToken: data.auth.access_token,
              refreshToken: data.auth.refresh_token,
              user: toAuthUser(data.user as unknown as ApiUser),
            }),
          );
        } catch (err) {
          console.error("Login error:", err);
        }
      },

      invalidatesTags: ["AUTH"], // auth cache yangilansin
    }),

    // Logout endpoint
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({
        url: AUTH.LOGOUT,
        method: "POST",
      }),

      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;

          // Logout bo‘lsa local auth state ni tozalaymiz
          dispatch(clearAuth());
        } catch (err) {
          // Backend ishlamasa ham local logout qilamiz
          dispatch(clearAuth());
          console.error("Logout error:", err);
        }
      },

      invalidatesTags: ["AUTH"],
    }),

    // Refresh token endpoint (access tokenni yangilash uchun)
    refresh: builder.mutation<AuthResponse, RefreshTokenRequest>({
      query: (body) => ({
        url: AUTH.REFRESH,
        method: "POST",
        body,
      }),
    }),
  }),
});

// RTK Query hooklari (componentlarda ishlatish uchun)
export const {
  useMeQuery,
  useLazyMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
} = authApi;
