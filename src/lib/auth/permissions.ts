import type { AuthRole } from '@/store/slices/auth.slice'

export function canManagePurchases(role: AuthRole | null | undefined): boolean {
  return role === 'OWNER_ADMIN' || role === 'ADMIN' || role === 'MANAGER' || role === 'CASHIER'
}

export function canViewPurchases(role: AuthRole | null | undefined): boolean {
  return (
    role === 'OWNER_ADMIN' ||
    role === 'ADMIN' ||
    role === 'MANAGER' ||
    role === 'CASHIER' ||
    role === 'TECHNICIAN'
  )
}

export function canManageSales(role: AuthRole | null | undefined): boolean {
  return role === 'OWNER_ADMIN' || role === 'ADMIN' || role === 'MANAGER' || role === 'CASHIER'
}

export function canViewSales(role: AuthRole | null | undefined): boolean {
  return (
    role === 'OWNER_ADMIN' ||
    role === 'ADMIN' ||
    role === 'MANAGER' ||
    role === 'CASHIER' ||
    role === 'TECHNICIAN'
  )
}

export function canViewCustomers(role: AuthRole | null | undefined): boolean {
  return role === 'OWNER_ADMIN' || role === 'ADMIN' || role === 'MANAGER' || role === 'CASHIER'
}

export function canManageCustomers(role: AuthRole | null | undefined): boolean {
  return role === 'OWNER_ADMIN' || role === 'ADMIN' || role === 'MANAGER'
}

export function canManageRepairs(role: AuthRole | null | undefined): boolean {
  return role === 'OWNER_ADMIN' || role === 'ADMIN' || role === 'MANAGER' || role === 'TECHNICIAN'
}

export function canViewRepairs(role: AuthRole | null | undefined): boolean {
  return (
    role === 'OWNER_ADMIN' ||
    role === 'ADMIN' ||
    role === 'MANAGER' ||
    role === 'CASHIER' ||
    role === 'TECHNICIAN'
  )
}

export function canManageWorkers(role: AuthRole | null | undefined): boolean {
  return role === 'OWNER_ADMIN' || role === 'ADMIN'
}
