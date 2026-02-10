import * as React from "react";
import { Navigate } from "react-router-dom";
import { CustomersPageHeader } from "./components/customers-header";
import { CustomersFilters } from "./components/customers-filters";
import { CustomersSummaryRow } from "./components/customers-summary";
import { CustomersTable } from "./components/customers-table";
import { CustomerDetailsModal } from "./modals/customer-details-modal";
import { AddPaymentModal } from "@/app/pos/sales/modals/add-payment-modal";
import { EditSaleModal } from "@/app/pos/sales/modals/edit-sale-modal";
import { AddPurchasePaymentModal } from "@/app/pos/purchases/modals/add-payment-modal";
import { EditPurchaseModal } from "@/app/pos/purchases/modals/edit-purchase-modal";
import {
  ApiRequestError,
  getCustomerDetail,
  listCustomerBalances,
  type CustomerBalanceRow,
  type CustomerBalanceType,
  type CustomerDetail,
} from "@/lib/api/customers";
import {
  addSalePayment,
  getSale,
  type SaleDetail,
  type UpdateSalePayload,
  updateSale,
} from "@/lib/api/sales";
import {
  addPurchasePayment,
  getPurchase,
  type PurchaseDetail,
  type UpdatePurchasePayload,
  updatePurchase,
} from "@/lib/api/purchases";
import {
  canManageCustomers,
  canManagePurchases,
  canManageSales,
  canViewCustomers,
} from "@/lib/auth/permissions";
import { useI18n } from "@/lib/i18n/provider";
import { useAppSelector } from "@/store/hooks";

const PAGE_LIMIT = 10;

export default function CustomersPage() {
  const { language } = useI18n();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canView = canViewCustomers(role);
  const canManage = canManageCustomers(role);
  const canManageTransactions = canManageSales(role) || canManagePurchases(role);

  const [rows, setRows] = React.useState<CustomerBalanceRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [searchDebounced, setSearchDebounced] = React.useState("");
  const [type, setType] = React.useState<CustomerBalanceType>("all");

  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<CustomerBalanceRow | null>(null);
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerDetail | null>(null);
  const [salePaymentOpen, setSalePaymentOpen] = React.useState(false);
  const [saleEditOpen, setSaleEditOpen] = React.useState(false);
  const [purchasePaymentOpen, setPurchasePaymentOpen] = React.useState(false);
  const [purchaseEditOpen, setPurchaseEditOpen] = React.useState(false);
  const [selectedSale, setSelectedSale] = React.useState<SaleDetail | null>(null);
  const [selectedPurchase, setSelectedPurchase] = React.useState<PurchaseDetail | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setSearchDebounced(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = React.useCallback(async () => {
    if (!canView) return;

    try {
      setLoading(true);
      setError(null);

      const response = await listCustomerBalances({
        page,
        limit: PAGE_LIMIT,
        search: searchDebounced.trim() || undefined,
        type,
      });

      setRows(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (requestError) {
      if (requestError instanceof ApiRequestError && requestError.status === 401) {
        setError(
          language === "uz"
            ? "Sessiya tugadi. Qayta tizimga kiring."
            : "Session expired. Please sign in again.",
        );
      } else if (
        requestError instanceof ApiRequestError &&
        requestError.status === 403
      ) {
        setError(language === "uz" ? "Ruxsat yo'q" : "Forbidden");
      } else {
        setError(
          requestError instanceof Error
            ? requestError.message
            : language === "uz"
              ? "Mijozlarni yuklab bo'lmadi"
              : "Failed to load customers",
        );
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [canView, language, page, searchDebounced, type]);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (!canView) {
    return <Navigate to="/errors/forbidden" replace />;
  }

  const summary = {
    totalCustomers: total,
    customersWithDebt: rows.filter((row) => row.debt > 0).length,
    customersWithCredit: rows.filter((row) => row.credit > 0).length,
    totalDebt: rows.reduce((sum, row) => sum + row.debt, 0),
    totalCredit: rows.reduce((sum, row) => sum + row.credit, 0),
  };

  async function handleOpenDetails(row: CustomerBalanceRow) {
    setSelectedRow(row);
    setSelectedCustomer(null);
    setDetailsOpen(true);

    try {
      const customer = await getCustomerDetail(row.customer.id);
      setSelectedCustomer(customer);
    } catch {
      setSelectedCustomer(null);
    }
  }

  async function reloadSelectedCustomer() {
    if (!selectedRow) return;
    const customer = await getCustomerDetail(selectedRow.customer.id);
    setSelectedCustomer(customer);
  }

  async function openSalePayment(saleId: number) {
    const sale = await getSale(saleId);
    setSelectedSale(sale);
    setSalePaymentOpen(true);
  }

  async function openSaleEdit(saleId: number) {
    const sale = await getSale(saleId);
    setSelectedSale(sale);
    setSaleEditOpen(true);
  }

  async function openPurchasePayment(purchaseId: number) {
    const purchase = await getPurchase(purchaseId);
    setSelectedPurchase(purchase);
    setPurchasePaymentOpen(true);
  }

  async function openPurchaseEdit(purchaseId: number) {
    const purchase = await getPurchase(purchaseId);
    setSelectedPurchase(purchase);
    setPurchaseEditOpen(true);
  }

  async function handleSaleAddPayment(saleId: number, amount: number) {
    await addSalePayment(saleId, { amount });
    setSalePaymentOpen(false);
    await Promise.all([load(), reloadSelectedCustomer()]);
  }

  async function handleSaleEdit(saleId: number, payload: UpdateSalePayload) {
    await updateSale(saleId, payload);
    setSaleEditOpen(false);
    await Promise.all([load(), reloadSelectedCustomer()]);
  }

  async function handlePurchaseAddPayment(purchaseId: number, amount: number) {
    await addPurchasePayment(purchaseId, { amount });
    setPurchasePaymentOpen(false);
    await Promise.all([load(), reloadSelectedCustomer()]);
  }

  async function handlePurchaseEdit(
    purchaseId: number,
    payload: UpdatePurchasePayload,
  ) {
    await updatePurchase(purchaseId, payload);
    setPurchaseEditOpen(false);
    await Promise.all([load(), reloadSelectedCustomer()]);
  }

  return (
    <div className="space-y-6">
      <CustomersPageHeader />

      <CustomersFilters
        search={search}
        type={type}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
        onTypeChange={(value) => {
          setPage(1);
          setType(value);
        }}
        onReset={() => {
          setPage(1);
          setSearch("");
          setType("all");
        }}
      />

      <CustomersSummaryRow summary={summary} />

      <CustomersTable
        rows={rows}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        total={total}
        canManage={canManage}
        onPageChange={setPage}
        onRowClick={(row) => {
          void handleOpenDetails(row);
        }}
        onViewDetails={(row) => {
          void handleOpenDetails(row);
        }}
        onEdit={(row) => {
          void handleOpenDetails(row);
        }}
      />

      <CustomerDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        row={selectedRow}
        customer={selectedCustomer}
        canManage={canManageTransactions}
        onAddSalePayment={(saleId) => {
          void openSalePayment(saleId);
        }}
        onAddPurchasePayment={(purchaseId) => {
          void openPurchasePayment(purchaseId);
        }}
        onEditSale={(saleId) => {
          void openSaleEdit(saleId);
        }}
        onEditPurchase={(purchaseId) => {
          void openPurchaseEdit(purchaseId);
        }}
      />

      <AddPaymentModal
        open={salePaymentOpen}
        onOpenChange={setSalePaymentOpen}
        sale={selectedSale}
        onSubmit={handleSaleAddPayment}
      />

      <EditSaleModal
        open={saleEditOpen}
        onOpenChange={setSaleEditOpen}
        canManage={canManage}
        sale={selectedSale}
        onSubmit={handleSaleEdit}
      />

      <AddPurchasePaymentModal
        open={purchasePaymentOpen}
        onOpenChange={setPurchasePaymentOpen}
        purchase={selectedPurchase}
        onSubmit={handlePurchaseAddPayment}
      />

      <EditPurchaseModal
        open={purchaseEditOpen}
        onClose={() => setPurchaseEditOpen(false)}
        canManage={canManage}
        purchase={selectedPurchase}
        onSubmit={handlePurchaseEdit}
      />
    </div>
  );
}
