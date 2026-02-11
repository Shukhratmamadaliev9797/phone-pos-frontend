export type DashboardHeadingProps = {
  title?: string;
  subtitle?: string;
};

export type KPI = {
  title: string;
  value: string;
  deltaPercent: number; // e.g. 10 => +10%, -12 => -12%
  deltaLabel?: string; // e.g. "From Last Month"
  variant?: "primary" | "default";
  icon?: React.ElementType;
};

export type Row = {
  phone: string;
  amount: number;
  status: "Paid" | "Credit";
};

export type Row2 = {
  phone: string;
  amount: number;
  status: "Paid" | "Debt";
};

export type Range = "weekly" | "monthly" | "yearly";
