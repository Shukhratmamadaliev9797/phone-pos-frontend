import type { AxiosError } from "axios";
import api from "@/lib/api";

export type DashboardKpiItem = {
  current: number;
  previous: number;
  deltaPercent: number;
};

export type DashboardOverview = {
  kpis: {
    profit: DashboardKpiItem;
    purchaseSpending: DashboardKpiItem;
    repairSpending: DashboardKpiItem;
    soldPhones: DashboardKpiItem;
  };
  paidVsUnpaid: {
    debt: number;
    credit: number;
  };
  salesRevenue: {
    weekly: Array<{ name: string; revenue: number }>;
    monthly: Array<{ name: string; revenue: number }>;
    yearly: Array<{ name: string; revenue: number }>;
  };
  topDebtCustomers: Array<{
    id: number;
    name: string;
    phone: string;
    amount: number;
  }>;
  topCreditCustomers: Array<{
    id: number;
    name: string;
    phone: string;
    amount: number;
  }>;
  recentSales: Array<{
    phone: string;
    amount: number;
    status: string;
  }>;
  recentPurchases: Array<{
    phone: string;
    amount: number;
    status: string;
  }>;
};

export class ApiRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function normalizeApiError(error: unknown): ApiRequestError {
  const axiosError = error as AxiosError<{ message?: string | string[] }>;
  const status = axiosError.response?.status;
  const payload = axiosError.response?.data?.message;
  const message = Array.isArray(payload) ? payload.join(", ") : payload;
  return new ApiRequestError(message || axiosError.message || "Request failed", status);
}

async function request<T>(call: () => Promise<{ data: T }>): Promise<T> {
  try {
    const response = await call();
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  return request(() => api.get("/api/dashboard/overview"));
}
