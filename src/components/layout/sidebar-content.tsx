import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { navSections } from "./nav-items";
import { ChevronLeft, ChevronRight, Smartphone } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { useAppSelector } from "@/store/hooks";
import { clearAuth } from "@/store/slices/auth.slice";
import { logout as clearStoredAuth } from "@/services/auth.service";
import { useI18n } from "@/lib/i18n/provider";

type SidebarContentProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void; // mobile: close sheet on click
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarContent({
  collapsed = false,
  onToggle,
  onNavigate,
}: SidebarContentProps) {
  const { t } = useI18n();
  const role = useAppSelector((state) => state.auth.user?.role);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const isAdmin = role === "ADMIN" || role === "OWNER_ADMIN";
  const hiddenForNonAdmin = new Set(["/workers", "/reports", "/settings"]);
  const visibleSections = isAdmin
    ? navSections
    : navSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => !hiddenForNonAdmin.has(item.href)),
        }))
        .filter((section) => section.items.length > 0);

  function getSectionLabel(label: string): string {
    if (label === "MENU") return t("nav.section.menu");
    if (label === "GENERAL") return t("nav.section.general");
    return label;
  }

  function getItemTitle(href: string, fallback: string): string {
    const map: Record<string, string> = {
      "/dashboard": "nav.dashboard",
      "/inventory": "nav.inventory",
      "/purchases": "nav.purchases",
      "/sales": "nav.sales",
      "/customers": "nav.customers",
      "/repairs": "nav.repairs",
      "/workers": "nav.workers",
      "/reports": "nav.reports",
      "/settings": "nav.settings",
      "/help": "nav.help",
      "/logout": "nav.logout",
    };
    const key = map[href];
    return key ? t(key) : fallback;
  }

  function handleLogout() {
    clearStoredAuth();
    dispatch(clearAuth());
    onNavigate?.();
    navigate("/auth/sign-in", { replace: true });
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-3xl bg-muted/30 border border-muted/40 p-4 shadow-sm",
        "transition-[width] duration-200",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center gap-3 px-2",
          collapsed && "flex-col justify-center gap-2 px-0",
        )}
      >
        <div className="h-10 w-10 shrink-0 rounded-2xl bg-white border flex items-center justify-center">
          <Smartphone className="h-5 w-5 text-emerald-600" />
        </div>

        {!collapsed && <div className="text-base font-semibold">{t("sidebar.brand")}</div>}

        {onToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn("ml-auto h-9 w-9 rounded-xl", collapsed && "hidden")}
            aria-label={t("sidebar.collapse")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {onToggle && collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-9 w-9 shrink-0 rounded-xl"
            aria-label={t("sidebar.expand")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Sections */}
      <div className="mt-6 flex-1 overflow-y-auto">
        {visibleSections.map((section) => (
          <div key={section.label} className="mb-6">
            {!collapsed && (
                <div className="px-2 text-[11px] font-medium tracking-wider text-muted-foreground">
                {getSectionLabel(section.label)}
              </div>
            )}

            <ul className="mt-2 space-y-1">
              {section.items.map((item) => {
                const active = isActivePath(location.pathname, item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={(event) => {
                        if (item.href === "/logout") {
                          event.preventDefault();
                          handleLogout();
                          return;
                        }
                        onNavigate?.();
                      }}
                      className={cn(
                        "relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                        collapsed && "justify-center px-0",
                        active
                          ? "text-foreground dark:text-emerald-100"
                          : "text-muted-foreground hover:bg-white/60 hover:text-foreground dark:hover:bg-emerald-950/40 dark:hover:text-emerald-100"
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-9 w-1.5 -translate-y-1/2 rounded-r-full bg-emerald-600 shadow-[0_0_0_1px_rgba(5,150,105,0.12)] dark:bg-emerald-400 dark:shadow-[0_0_0_1px_rgba(16,185,129,0.28)]" />
                      )}

                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl",
                          active ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>

                      {!collapsed && (
                        <span className={cn("text-sm", active ? "font-semibold" : "font-medium")}>
                          {getItemTitle(item.href, item.title)}
                        </span>
                      )}

                      {!collapsed && item.badge && (
                        <span className="ml-auto rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-semibold text-white">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
