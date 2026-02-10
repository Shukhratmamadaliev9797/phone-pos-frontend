import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportsPageHeader } from "./components/reports-header";
import { ReportsKpiRow } from "./components/reports-kpi-row";
import { SalesReportPanel } from "./panels/sales-report-panel";
import { PurchasesReportPanel } from "./panels/purchases-report-panel";
import { RepairsReportPanel } from "./panels/repairs-report-panel";
import { CustomersReportPanel } from "./panels/customers-report-panel";
import { WorkersReportPanel } from "./panels/workers.report-panel";
import { getReportsOverview, type ReportsOverview } from "@/lib/api/reports";
import { useI18n } from "@/lib/i18n/provider";

const EMPTY_DATA: ReportsOverview = {
  salesRevenue: 0,
  profit: 0,
  purchaseSpending: 0,
  repairSpending: 0,
  unpaidSalesDebt: 0,
  unpaidPurchasesCredit: 0,
  salesRevenueSeries: [],
  salesPhonesSold: 0,
  salesAvgPrice: 0,
  salesPaidNowTotal: 0,
  salesRemainingDebt: 0,
  purchasesSpendingSeries: [],
  purchasesPhonesBought: 0,
  purchasesAvgCost: 0,
  purchasesPaidNowTotal: 0,
  purchasesRemainingCredit: 0,
  repairsSpendingSeries: [],
  repairsCount: 0,
  repairsTotalSpending: 0,
  repairsPending: 0,
  repairsAvgCost: 0,
  repairsTopTechnician: "N/A",
  debtCustomers: [],
  creditCustomers: [],
  workersCount: 0,
  workersTotalSalaryPaid: 0,
  workersPendingPayments: 0,
  workerPayments: [],
};

export default function Reports() {
  const { language } = useI18n();
  const [data, setData] = React.useState<ReportsOverview>(EMPTY_DATA);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getReportsOverview();
        setData(response);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : language === "uz"
              ? "Hisobot ma'lumotlarini yuklab bo'lmadi"
              : "Failed to load reports data",
        );
        setData(EMPTY_DATA);
      } finally {
        setLoading(false);
      }
    })();
  }, [language]);

  const exportPdf = React.useCallback(() => {
    const escapeHtml = (value: string) =>
      value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    const money = (value: number) =>
      `${Math.round(value).toLocaleString("en-US")} so'm`;

    const topDebt = data.debtCustomers
      .slice(0, 5)
      .map((row, idx) => {
        return `<tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.phone)}</td>
          <td>${money(row.amount)}</td>
        </tr>`;
      })
      .join("");

    const topCredit = data.creditCustomers
      .slice(0, 5)
      .map((row, idx) => {
        return `<tr>
          <td>${idx + 1}</td>
          <td>${escapeHtml(row.name)}</td>
          <td>${escapeHtml(row.phone)}</td>
          <td>${money(row.amount)}</td>
        </tr>`;
      })
      .join("");

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${language === "uz" ? "POS Hisobot" : "POS Report"}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111827; }
    h1 { margin: 0 0 6px; font-size: 22px; }
    p { margin: 0 0 14px; color: #6b7280; }
    .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 18px; }
    .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; }
    .label { font-size: 11px; color: #6b7280; margin-bottom: 5px; }
    .value { font-size: 16px; font-weight: 700; }
    h2 { font-size: 14px; margin: 18px 0 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { border: 1px solid #e5e7eb; padding: 6px 8px; font-size: 12px; text-align: left; }
    th { background: #f9fafb; }
  </style>
</head>
<body>
  <h1>${language === "uz" ? "Phone Shop POS Hisobot" : "Phone Shop POS Report"}</h1>
  <p>${language === "uz" ? "Yaratilgan vaqt" : "Generated"}: ${new Date().toLocaleString()}</p>

  <div class="grid">
    <div class="card"><div class="label">${language === "uz" ? "Sotuv daromadi" : "Sales Revenue"}</div><div class="value">${money(data.salesRevenue)}</div></div>
    <div class="card"><div class="label">${language === "uz" ? "Foyda" : "Profit"}</div><div class="value">${money(data.profit)}</div></div>
    <div class="card"><div class="label">${language === "uz" ? "Xarid xarajati" : "Purchase Spending"}</div><div class="value">${money(data.purchaseSpending)}</div></div>
    <div class="card"><div class="label">${language === "uz" ? "Ta'mir xarajati" : "Repair Spending"}</div><div class="value">${money(data.repairSpending)}</div></div>
    <div class="card"><div class="label">${language === "uz" ? "To'lanmagan sotuvlar (qarz)" : "Unpaid Sales (Debt)"}</div><div class="value">${money(data.unpaidSalesDebt)}</div></div>
    <div class="card"><div class="label">${language === "uz" ? "To'lanmagan xaridlar (kredit)" : "Unpaid Purchases (Credit)"}</div><div class="value">${money(data.unpaidPurchasesCredit)}</div></div>
  </div>

  <h2>${language === "uz" ? "Sotuv ko'rsatkichi" : "Sales Snapshot"}</h2>
  <table>
    <tr><th>${language === "uz" ? "Sotilgan telefonlar" : "Phones Sold"}</th><th>${language === "uz" ? "O'rtacha sotuv narxi" : "Avg Sale Price"}</th><th>${language === "uz" ? "Hozir to'langan" : "Paid Now"}</th><th>${language === "uz" ? "Qolgan qarz" : "Remaining Debt"}</th></tr>
    <tr><td>${data.salesPhonesSold}</td><td>${money(data.salesAvgPrice)}</td><td>${money(data.salesPaidNowTotal)}</td><td>${money(data.salesRemainingDebt)}</td></tr>
  </table>

  <h2>${language === "uz" ? "Xarid ko'rsatkichi" : "Purchases Snapshot"}</h2>
  <table>
    <tr><th>${language === "uz" ? "Sotib olingan telefonlar" : "Phones Bought"}</th><th>${language === "uz" ? "O'rtacha xarid narxi" : "Avg Purchase Cost"}</th><th>${language === "uz" ? "Hozir to'langan" : "Paid Now"}</th><th>${language === "uz" ? "Qolgan kredit" : "Remaining Credit"}</th></tr>
    <tr><td>${data.purchasesPhonesBought}</td><td>${money(data.purchasesAvgCost)}</td><td>${money(data.purchasesPaidNowTotal)}</td><td>${money(data.purchasesRemainingCredit)}</td></tr>
  </table>

  <h2>${language === "uz" ? "Ta'mir ko'rsatkichi" : "Repairs Snapshot"}</h2>
  <table>
    <tr><th>${language === "uz" ? "Ta'mirlar soni" : "Repairs Count"}</th><th>${language === "uz" ? "Jami xarajat" : "Total Spending"}</th><th>${language === "uz" ? "Kutilmoqda" : "Pending"}</th><th>${language === "uz" ? "O'rtacha narx" : "Avg Cost"}</th><th>${language === "uz" ? "Eng faol texnik" : "Top Technician"}</th></tr>
    <tr>
      <td>${data.repairsCount}</td>
      <td>${money(data.repairsTotalSpending)}</td>
      <td>${data.repairsPending}</td>
      <td>${money(data.repairsAvgCost)}</td>
      <td>${escapeHtml(data.repairsTopTechnician)}</td>
    </tr>
  </table>

  <h2>${language === "uz" ? "Eng katta qarzdor mijozlar" : "Top Debt Customers"}</h2>
  <table>
    <tr><th>#</th><th>${language === "uz" ? "Ism" : "Name"}</th><th>${language === "uz" ? "Telefon" : "Phone"}</th><th>${language === "uz" ? "Qarz" : "Debt"}</th></tr>
    ${topDebt || `<tr><td colspan="4">${language === "uz" ? "Ma'lumot yo'q" : "No data"}</td></tr>`}
  </table>

  <h2>${language === "uz" ? "Eng katta kreditli mijozlar" : "Top Credit Customers"}</h2>
  <table>
    <tr><th>#</th><th>${language === "uz" ? "Ism" : "Name"}</th><th>${language === "uz" ? "Telefon" : "Phone"}</th><th>${language === "uz" ? "Kredit" : "Credit"}</th></tr>
    ${topCredit || `<tr><td colspan="4">${language === "uz" ? "Ma'lumot yo'q" : "No data"}</td></tr>`}
  </table>

  <script>
    window.onload = () => {
      window.print();
    };
  </script>
</body>
</html>`;

    const printWindow = window.open("", "_blank", "width=980,height=780");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }, [data, language]);

  return (
    <div className="space-y-6">
      <ReportsPageHeader onExportPdf={exportPdf} />
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          {language === "uz" ? "Hisobotlar yuklanmoqda..." : "Loading reports..."}
        </div>
      ) : null}

      <ReportsKpiRow data={data} />

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="rounded-2xl">
          <TabsTrigger value="sales">{language === "uz" ? "Sotuvlar" : "Sales"}</TabsTrigger>
          <TabsTrigger value="purchases">{language === "uz" ? "Xaridlar" : "Purchases"}</TabsTrigger>
          <TabsTrigger value="repairs">{language === "uz" ? "Ta'mirlar" : "Repairs"}</TabsTrigger>
          <TabsTrigger value="customers">{language === "uz" ? "Mijozlar" : "Customers"}</TabsTrigger>
          <TabsTrigger value="workers">{language === "uz" ? "Xodimlar" : "Workers"}</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesReportPanel data={data} />
        </TabsContent>

        <TabsContent value="purchases">
          <PurchasesReportPanel data={data} />
        </TabsContent>

        <TabsContent value="repairs">
          <RepairsReportPanel data={data} />
        </TabsContent>

        <TabsContent value="customers">
          <CustomersReportPanel data={data} />
        </TabsContent>

        <TabsContent value="workers">
          <WorkersReportPanel data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
