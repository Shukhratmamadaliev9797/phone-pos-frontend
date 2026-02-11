import type { CustomerBalanceRow } from "@/lib/api/customers";

export type Summary = {
  totalCustomers: number;
  customersWithDebt: number;
  customersWithCredit: number;
  totalDebt: number;
  totalCredit: number;
};

export type CustomerRow = CustomerBalanceRow;
