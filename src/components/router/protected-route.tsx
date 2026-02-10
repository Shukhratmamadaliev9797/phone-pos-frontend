import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { PageLoader } from "@/components/ui/page-loader";

export type Role = "ADMIN" | "MANAGER" | "CASHIER" | "TECHNICIAN";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: Role[];
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Redux localStorage hydrate uchun
  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isChecking) return <PageLoader />;

  // Protected page: login bo‘lmagan bo‘lsa sign-in ga yuboramiz
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  // Role restriction
  if (requireAuth && allowedRoles?.length) {
    const role = (user?.role ?? null) as Role | null;

    // user yo‘q bo‘lsa (noto‘g‘ri state) -> unauthorized
    if (!role) {
      return <Navigate to="/errors/unauthorized" replace />;
    }

    if (!allowedRoles.includes(role)) {
      return <Navigate to="/errors/forbidden" replace />;
    }
  }

  // Public auth pages: login bo‘lgan user kirsa dashboardga qaytaramiz
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
