export type DatePreset = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR" | "CUSTOM";
export type PaymentTypeFilter = "ALL" | "PAID_NOW" | "PAY_LATER";
export type PaymentMethodFilter = "ALL" | "CASH" | "CARD" | "OTHER";
export type StatusFilter = "ALL" | "PAID" | "PARTIAL" | "UNPAID";
export type ReportsFiltersValue = {
  q: string;
  datePreset: DatePreset;
  paymentType: PaymentTypeFilter;
  paymentMethod: PaymentMethodFilter;
  status: StatusFilter;
};