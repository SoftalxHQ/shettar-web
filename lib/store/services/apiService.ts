import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { RootState } from "../store";
import { clearCredentials, setCredentials } from "../slices/authSlice";
import type { StoredUser } from "@/app/helpers/auth";
import type { NotificationItem } from "@/app/context/NotificationContext";

// ─── AccountProfile type (mirrors app/hooks/useAccountProfile.tsx) ────────────
export interface AccountProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  other_name?: string | null;
  phone_number?: string | null;
  address?: string | null;
  zip_code?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  wallet_balance?: number | string | null;
  account_unique_id?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  avatar_url?: string | null;
  emer_first_name?: string | null;
  emer_last_name?: string | null;
  emer_phone_number?: string | null;
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    // Only redirect if we actually had a token — prevents redirect loops during
    // redux-persist rehydration when the store is temporarily empty.
    const token = (api.getState() as RootState).auth.token;
    if (token) {
      api.dispatch(clearCredentials());
      if (typeof window !== "undefined") {
        window.location.href = "/auth/sign-in";
      }
    } else {
      // No token — just clear credentials silently, no redirect
      api.dispatch(clearCredentials());
    }
  }
  return result;
};

// ─── Response types ───────────────────────────────────────────────────────────

export interface AuthResponse {
  status: {
    code: number;
    message: string;
    data: StoredUser;
  };
  data: StoredUser;
}

export interface SignInArgs {
  email: string;
  password: string;
}

export interface SignUpArgs {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyEmailArgs {
  email: string;
  code: string;
}

export interface ResendVerificationArgs {
  email: string;
}

export interface RequestPasswordResetArgs {
  email: string;
}

export interface ResetPasswordArgs {
  reset_password_token: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyPhoneArgs {
  code: string;
}

export interface UpdateAccountProfileArgs {
  fields: Partial<AccountProfile>;
  avatarFile?: File | null;
}

export interface ChangePasswordArgs {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// ─── API Service ──────────────────────────────────────────────────────────────

export const apiService = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "AccountProfile",
    "Notifications",
    "Reservations",
    "Wallet",
    "Transactions",
    "Reviews",
    "Wishlists",
    "Categories",
    "Locations",
  ],
  endpoints: (builder) => ({
    // ── Auth ──────────────────────────────────────────────────────────────────

    signIn: builder.mutation<AuthResponse, SignInArgs>({
      query: (credentials) => ({
        url: "/accounts/sign_in",
        method: "POST",
        body: { account: credentials },
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          const authHeader = (meta as any)?.response?.headers?.get(
            "Authorization",
          );
          const token = authHeader?.replace("Bearer ", "") ?? "";
          const user = data.data;
          if (token && user) {
            dispatch(setCredentials({ token, user }));
          }
        } catch {
          // sign-in failed — do nothing
        }
      },
    }),

    signUp: builder.mutation<AuthResponse, SignUpArgs>({
      query: (payload) => ({
        url: "/accounts/sign_up",
        method: "POST",
        body: { account: payload },
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data, meta } = await queryFulfilled;
          const authHeader = (meta as any)?.response?.headers?.get(
            "Authorization",
          );
          const token = authHeader?.replace("Bearer ", "") ?? "";
          const user = data.data ?? data.status?.data;
          if (token && user) {
            dispatch(setCredentials({ token, user }));
          }
        } catch {
          // sign-up failed — do nothing
        }
      },
    }),

    signOut: builder.mutation<void, void>({
      query: () => ({
        url: "/accounts/sign_out",
        method: "DELETE",
      }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
        }
      },
    }),

    verifyEmail: builder.mutation<unknown, VerifyEmailArgs>({
      query: ({ email, code }) => ({
        url: "/accounts/verify_email",
        method: "POST",
        body: { account: { email, code } },
      }),
    }),

    resendVerification: builder.mutation<unknown, ResendVerificationArgs>({
      query: ({ email }) => ({
        url: "/accounts/resend_verification",
        method: "POST",
        body: { account: { email } },
      }),
    }),

    requestPasswordReset: builder.mutation<unknown, RequestPasswordResetArgs>({
      query: ({ email }) => ({
        url: "/accounts/reset_password",
        method: "POST",
        body: { account: { email } },
      }),
    }),

    resetPassword: builder.mutation<unknown, ResetPasswordArgs>({
      query: ({ reset_password_token, password, password_confirmation }) => ({
        url: "/accounts/update_password",
        method: "PUT",
        body: {
          account: { reset_password_token, password, password_confirmation },
        },
      }),
    }),

    verifyPhone: builder.mutation<unknown, VerifyPhoneArgs>({
      query: ({ code }) => ({
        url: "/accounts/verify_phone",
        method: "POST",
        body: { account: { code } },
      }),
    }),

    resendPhoneVerification: builder.mutation<void, void>({
      query: () => ({
        url: "/accounts/resend_phone_verification",
        method: "POST",
      }),
    }),

    // ── Account Profile ───────────────────────────────────────────────────────

    getAccountDetails: builder.query<AccountProfile, void>({
      query: () => "/account_details",
      // API returns { status: { code: 200 }, data: { ...profile } }
      transformResponse: (response: { status: { code: number }; data: AccountProfile }) =>
        response.data,
      providesTags: ["AccountProfile"],
      async onQueryStarted(_args, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const token = (getState() as RootState).auth.token;
          if (token) {
            dispatch(setCredentials({ token, user: data as unknown as StoredUser }));
          }
        } catch {
          // query failed — do nothing
        }
      },
    }),

    updateAccountProfile: builder.mutation<unknown, UpdateAccountProfileArgs>({
      query: ({ fields, avatarFile }) => {
        if (avatarFile) {
          const formData = new FormData();
          Object.entries(fields).forEach(([k, v]) => {
            if (v !== undefined && v !== null) {
              formData.append(`account[${k}]`, v as string);
            }
          });
          formData.append("account[avatar]", avatarFile);
          return { url: "/accounts/update", method: "PUT", body: formData };
        }
        return {
          url: "/accounts/update",
          method: "PUT",
          body: { account: fields },
        };
      },
      invalidatesTags: ["AccountProfile"],
    }),

    changePassword: builder.mutation<unknown, ChangePasswordArgs>({
      query: ({ current_password, password, password_confirmation }) => ({
        url: "/accounts/change_password",
        method: "PUT",
        body: { account: { current_password, password, password_confirmation } },
      }),
    }),

    deleteAccount: builder.mutation<void, void>({
      query: () => ({ url: "/accounts", method: "DELETE" }),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearCredentials());
        } catch {
          // deletion failed — do nothing
        }
      },
    }),

    // ── Notifications ─────────────────────────────────────────────────────────

    getNotifications: builder.query<NotificationItem[], void>({
      query: () => "/api/v1/notifications",
      // API returns { notifications: [...] } — unwrap it
      transformResponse: (response: { notifications: NotificationItem[] }) =>
        response.notifications ?? [],
      providesTags: ["Notifications"],
    }),

    getUnreadCount: builder.query<{ unread_count: number }, void>({
      query: () => "/api/v1/notifications/unread_count",
    }),

    markAsRead: builder.mutation<unknown, { id: number | "all" }>({
      query: (body) => ({
        url: "/api/v1/notifications/mark_as_read",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),

    deleteNotifications: builder.mutation<unknown, { id: number | "all" }>({
      query: (body) => ({
        url: "/api/v1/notifications/delete_notifications",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notifications"],
    }),

    // ── Businesses ────────────────────────────────────────────────────────────

    getBusinesses: builder.query<
      unknown,
      { search?: string; location?: string; category_id?: number; page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: "/api/v1/businesses", params: params ?? undefined }),
      providesTags: ["Categories"],
    }),

    getBusinessBySlug: builder.query<
      unknown,
      { slug: string; start_date?: string; end_date?: string; number_of_rooms?: number }
    >({
      query: ({ slug, ...params }) => ({
        url: `/api/v1/businesses/${slug}`,
        params: Object.keys(params).length ? params : undefined,
      }),
    }),

    getBusinessCategories: builder.query<unknown, void>({
      query: () => "/api/v1/businesses/categories",
      providesTags: ["Categories"],
    }),

    getBusinessLocations: builder.query<unknown, void>({
      query: () => "/api/v1/businesses/locations",
      providesTags: ["Locations"],
    }),

    getRoomType: builder.query<unknown, { hotelSlug: string; roomSlug: string }>({
      query: ({ hotelSlug, roomSlug }) =>
        `/api/v1/businesses/${hotelSlug}/room_types/${roomSlug}`,
    }),

    // ── Reservations ──────────────────────────────────────────────────────────

    getReservations: builder.query<
      unknown,
      { filter?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: "/api/v1/reservations", params: params ?? undefined }),
      providesTags: ["Reservations"],
    }),

    createReservation: builder.mutation<
      unknown,
      { hotelId: number | string; roomTypeId: number | string; body?: unknown }
    >({
      query: ({ hotelId, roomTypeId, body }) => ({
        url: `/api/v1/businesses/${hotelId}/room_types/${roomTypeId}/reservations`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Reservations"],
    }),

    cancelReservation: builder.mutation<
      unknown,
      { id: number | string; cancellation_reason: string }
    >({
      query: ({ id, cancellation_reason }) => ({
        url: `/api/v1/reservations/${id}/cancel`,
        method: "POST",
        body: { cancellation_reason },
      }),
      invalidatesTags: ["Reservations"],
    }),

    getCancellationPolicy: builder.query<unknown, void>({
      query: () => "/api/v1/cancellation_policy",
    }),

    // ── Wallet ────────────────────────────────────────────────────────────────

    getDvaDetails: builder.query<unknown, void>({
      query: () => "/api/v1/wallet/dva_details",
      providesTags: ["Wallet"],
    }),

    initializeTopup: builder.mutation<
      unknown,
      { amount: number; payment_method?: string }
    >({
      query: (body) => ({
        url: "/api/v1/wallet/initialize_topup",
        method: "POST",
        body,
      }),
    }),

    verifyTopup: builder.mutation<unknown, { reference: string }>({
      query: (body) => ({
        url: "/api/v1/wallet/verify_topup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wallet"],
    }),

    buyAirtime: builder.mutation<unknown, unknown>({
      query: (body) => ({
        url: "/api/v1/wallet/buy_airtime",
        method: "POST",
        body,
      }),
    }),

    buyData: builder.mutation<unknown, unknown>({
      query: (body) => ({
        url: "/api/v1/wallet/buy_data",
        method: "POST",
        body,
      }),
    }),

    getWalletTransactions: builder.query<
      unknown,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: "/api/v1/wallet_transactions", params: params ?? undefined }),
      providesTags: ["Transactions"],
    }),

    // ── Payment ───────────────────────────────────────────────────────────────

    initializePayment: builder.mutation<unknown, unknown>({
      query: (body) => ({
        url: "/api/v1/payment_initializations",
        method: "POST",
        body,
      }),
    }),

    // ── Reviews ───────────────────────────────────────────────────────────────

    getReviews: builder.query<unknown, void>({
      query: () => "/api/v1/reviews",
      providesTags: ["Reviews"],
    }),

    updateReview: builder.mutation<unknown, { id: number | string; body: unknown }>({
      query: ({ id, body }) => ({
        url: `/api/v1/reviews/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Reviews"],
    }),

    deleteReview: builder.mutation<unknown, { id: number | string }>({
      query: ({ id }) => ({
        url: `/api/v1/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reviews"],
    }),

    // ── Wishlists ─────────────────────────────────────────────────────────────

    getWishlists: builder.query<unknown, void>({
      query: () => "/api/v1/wishlists",
      providesTags: ["Wishlists"],
    }),

    checkWishlist: builder.query<unknown, { business_id: number | string }>({
      query: ({ business_id }) => ({
        url: "/api/v1/wishlists/check",
        params: { business_id },
      }),
    }),

    addWishlist: builder.mutation<unknown, unknown>({
      query: (body) => ({
        url: "/api/v1/wishlists",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Wishlists"],
    }),

    removeWishlist: builder.mutation<unknown, { businessId: number | string }>({
      query: ({ businessId }) => ({
        url: `/api/v1/wishlists/${businessId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlists"],
    }),

    clearWishlists: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/wishlists/clear",
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlists"],
    }),
  }),
});

export const {
  // Auth
  useSignInMutation,
  useSignUpMutation,
  useSignOutMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,
  useVerifyPhoneMutation,
  useResendPhoneVerificationMutation,
  // Account Profile
  useGetAccountDetailsQuery,
  useUpdateAccountProfileMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  // Notifications
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useDeleteNotificationsMutation,
  // Businesses
  useGetBusinessesQuery,
  useGetBusinessBySlugQuery,
  useGetBusinessCategoriesQuery,
  useGetBusinessLocationsQuery,
  useGetRoomTypeQuery,
  // Reservations
  useGetReservationsQuery,
  useCreateReservationMutation,
  useCancelReservationMutation,
  useGetCancellationPolicyQuery,
  // Wallet
  useGetDvaDetailsQuery,
  useInitializeTopupMutation,
  useVerifyTopupMutation,
  useBuyAirtimeMutation,
  useBuyDataMutation,
  useGetWalletTransactionsQuery,
  // Payment
  useInitializePaymentMutation,
  // Reviews
  useGetReviewsQuery,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  // Wishlists
  useGetWishlistsQuery,
  useCheckWishlistQuery,
  useAddWishlistMutation,
  useRemoveWishlistMutation,
  useClearWishlistsMutation,
} = apiService;
