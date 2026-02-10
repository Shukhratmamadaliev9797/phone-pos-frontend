import type { AxiosError } from "axios";
import api from "@/lib/api";

export type ReportsOverview = {
  salesRevenue: number;
  profit: number;
  purchaseSpending: number;
  repairSpending: number;
  unpaidSalesDebt: number;
  unpaidPurchasesCredit: number;
  salesRevenueSeries: Array<{ label: string; value: number }>;
  salesPhonesSold: number;
  salesAvgPrice: number;
  salesPaidNowTotal: number;
  salesRemainingDebt: number;
  purchasesSpendingSeries: Array<{ label: string; value: number }>;
  purchasesPhonesBought: number;
  purchasesAvgCost: number;
  purchasesPaidNowTotal: number;
  purchasesRemainingCredit: number;
  repairsSpendingSeries: Array<{ label: string; value: number }>;
  repairsCount: number;
  repairsTotalSpending: number;
  repairsPending: number;
  repairsAvgCost: number;
  repairsTopTechnician: string;
  debtCustomers: Array<{
    id: number;
    name: string;
    phone: string;
    amount: number;
    last: string;
  }>;
  creditCustomers: Array<{
    id: number;
    name: string;
    phone: string;
    amount: number;
    last: string;
  }>;
  workersCount: number;
  workersTotalSalaryPaid: number;
  workersPendingPayments: number;
  workerPayments: Array<{
    month: string;
    worker: string;
    salary: number;
    paid: number;
    lastPaid: string;
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

export async function getReportsOverview(): Promise<ReportsOverview> {
  return request(() => api.get("/api/reports/overview"));
}
