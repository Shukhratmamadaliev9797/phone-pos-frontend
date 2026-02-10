import type React from "react";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  CreditCard,
  Users,
  Wrench,
  BarChart3,
  Briefcase,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    label: "MENU",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Inventory", href: "/inventory", icon: Boxes },
      { title: "Purchases", href: "/purchases", icon: ShoppingCart },
      { title: "Sales", href: "/sales", icon: CreditCard },
      { title: "Customers", href: "/customers", icon: Users },
      { title: "Repairs", href: "/repairs", icon: Wrench },
      { title: "Workers", href: "/workers", icon: Briefcase },
      { title: "Reports", href: "/reports", icon: BarChart3 }, 
    ],
  },
  {
    label: "GENERAL",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Help", href: "/help", icon: HelpCircle },
      { title: "Logout", href: "/logout", icon: LogOut },
    ],
  },
];
