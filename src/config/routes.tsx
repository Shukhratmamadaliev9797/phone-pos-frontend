import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import { ProtectedRoute, type Role } from "@/components/router/protected-route";

// ========= Layout =========
const AppShell = lazy(() =>
  import("@/components/layout/app-shell").then((m) => ({ default: m.AppShell }))
);

// ========= Auth pages =========
const SignIn = lazy(() => import("@/app/auth/sign-in/page"));

// ========= Error pages =========
const Unauthorized = lazy(() => import("@/app/errors/unauthorized/page"));
const Forbidden = lazy(() => import("@/app/errors/forbidden/page"));
const NotFound = lazy(() => import("@/app/errors/not-found/page"));

// ========= POS pages =========
const Dashboard = lazy(() => import("@/app/pos/dashboard/page"));
const Inventory = lazy(() => import("@/app/pos/inventory/page"));
const Purchases = lazy(() => import("@/app/pos/purchases/page"));
const Sales = lazy(() => import("@/app/pos/sales/page"));
const Customers = lazy(() => import("@/app/pos/customers/page"));
const Repairs = lazy(() => import("@/app/pos/repairs/page"));
const Reports = lazy(() => import("@/app/pos/reports/page"));
const Workers = lazy(() => import("@/app/pos/workers/page"));
const Settings = lazy(() => import("@/app/pos/settings/page"));
const Help = lazy(() => import("@/app/pos/help/page"));
const Messages = lazy(() => import("@/app/pos/messages/page"));
const User = lazy(() => import("@/app/pos/user/page"));

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

// Helper: wrap protected/public pages
function P(
  node: React.ReactNode,
  allowedRoles?: Role[],
  requireAuth: boolean = true
) {
  return (
    <ProtectedRoute requireAuth={requireAuth} allowedRoles={allowedRoles}>
      {node}
    </ProtectedRoute>
  );
}

// ========= Role groups =========
const ALL: Role[] = ["ADMIN", "CASHIER", "TECHNICIAN"];
const STAFF: Role[] = ["ADMIN", "TECHNICIAN", "CASHIER"]; // sales/customers
const PURCHASES_VIEW: Role[] = ["ADMIN", "CASHIER", "TECHNICIAN"];
const MGMT: Role[] = ["ADMIN"]; // reports etc
const TECH: Role[] = ["ADMIN", "CASHIER", "TECHNICIAN"]; // repairs
const ADMIN: Role[] = ["ADMIN"];

export const routes: RouteConfig[] = [
  // Default -> dashboard
  { path: "/", element: <Navigate to="/dashboard" replace /> },

  // Auth (public)
  // login bo‘lgan user kirsa dashboardga ketadi (ProtectedRoute ichida bor)
  { path: "/auth/sign-in", element: P(<SignIn />, undefined, false) },

  // Errors (public)
  { path: "/errors/unauthorized", element: <Unauthorized /> },
  { path: "/errors/forbidden", element: <Forbidden /> },

  // POS layout (protected)
  // AppShell hamma staff uchun ochiq, ichida outlet orqali children chiqadi
  {
    path: "/",
    element: P(<AppShell />, ALL, true),
    children: [
      // Main pages (ALL)
      { path: "dashboard", element: P(<Dashboard />, ALL, true) },
      { path: "inventory", element: P(<Inventory />, ALL, true) },
      { path: "user", element: P(<User />, ALL, true) },
      { path: "help", element: P(<Help />, ALL, true) },

      // Cashier ops (STAFF)
      { path: "purchases", element: P(<Purchases />, PURCHASES_VIEW, true) },
      { path: "sales", element: P(<Sales />, STAFF, true) },
      { path: "customers", element: P(<Customers />, STAFF, true) },

      // Repairs (TECH)
      { path: "repairs", element: P(<Repairs />, TECH, true) },

      // Reports (MGMT)
      { path: "reports", element: P(<Reports />, MGMT, true) },

      // Admin only
      { path: "workers", element: P(<Workers />, ADMIN, true) },
      { path: "settings", element: P(<Settings />, ADMIN, true) },
      { path: "messages", element: P(<Messages />, ADMIN, true) },
    ],
  },

  // 404
  { path: "*", element: <NotFound /> },
];

