import * as React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardHeading } from "./components/dashboard-heading";
import { DashboardKpiRow } from "./components/kpi-row";
import { PaidVsUnpaidCard } from "./components/paid-vs-unpaid";
import { RecentPurchasesCard } from "./components/recent-purchase";
import { RecentSalesCard } from "./components/recent-sales";
import { SalesRevenueChart } from "./components/sales-revenue-chart";
import { TopCreditCustomersCard } from "./components/top-credit-customers";
import { TopDebtCustomersCard } from "./components/top-debt-customers";
import {
  getDashboardOverview,
  type DashboardOverview,
} from "@/lib/api/dashboard";
import { useI18n } from "@/lib/i18n/provider";

const EMPTY_OVERVIEW: DashboardOverview = {
  kpis: {
    profit: { current: 0, previous: 0, deltaPercent: 0 },
    purchaseSpending: { current: 0, previous: 0, deltaPercent: 0 },
    repairSpending: { current: 0, previous: 0, deltaPercent: 0 },
    soldPhones: { current: 0, previous: 0, deltaPercent: 0 },
  },
  paidVsUnpaid: {
    debt: 0,
    credit: 0,
  },
  salesRevenue: {
    weekly: [],
    monthly: [],
    yearly: [],
  },
  topDebtCustomers: [],
  topCreditCustomers: [],
  recentSales: [],
  recentPurchases: [],
};

export default function DashboardPage() {
  const { language } = useI18n();
  const navigate = useNavigate();
  const [overview, setOverview] = React.useState<DashboardOverview>(EMPTY_OVERVIEW);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadOverview = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardOverview();
      setOverview(response);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : language === "uz"
            ? "Dashboard ma'lumotlarini yuklashda xatolik"
            : "Failed to load dashboard data",
      );
      setOverview(EMPTY_OVERVIEW);
    } finally {
      setLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  return (
    <div className="space-y-6">
      <DashboardHeading />
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          {language === "uz" ? "Dashboard yuklanmoqda..." : "Loading dashboard..."}
        </div>
      ) : null}

      <DashboardKpiRow kpis={overview.kpis} />

      <div className="grid gap-4">
        <div className="col-span-full">
          <SalesRevenueChart series={overview.salesRevenue} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <PaidVsUnpaidCard
          paidVsUnpaid={overview.paidVsUnpaid}
          onViewDebts={() => navigate("/pos/customers?type=debt")}
          onViewCredits={() => navigate("/pos/customers?type=credit")}
        />
        <TopDebtCustomersCard rows={overview.topDebtCustomers} />
        <TopCreditCustomersCard rows={overview.topCreditCustomers} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RecentSalesCard rows={overview.recentSales} />
        <RecentPurchasesCard rows={overview.recentPurchases} />
      </div>
    </div>
  );
}
