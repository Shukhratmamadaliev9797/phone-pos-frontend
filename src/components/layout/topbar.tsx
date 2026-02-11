import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Menu, MessageSquare, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listInventoryItems, type InventoryListItem } from "@/lib/api/inventory";
import { InventoryDetailsModal } from "@/app/pos/inventory/modals/inventory-details-modal";
import type { InventoryRow } from "@/app/pos/inventory/components/inventory-table";
import { useAppSelector } from "@/store/hooks";
import { getStoredTheme, setTheme } from "@/lib/theme";
import { listSupportRequests } from "@/lib/api/support-requests";
import { useI18n } from "@/lib/i18n/provider";

type TopbarProps = {
  onOpenMobileSidebar?: () => void;
  className?: string;
};

export function Topbar({ onOpenMobileSidebar, className }: TopbarProps) {
  const authUser = useAppSelector((state) => state.auth.user);
  const { language, setLanguage, t } = useI18n();
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [recommendations, setRecommendations] = React.useState<InventoryListItem[]>([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InventoryRow | null>(null);
  const [theme, setThemeState] = React.useState<"light" | "dark">(() => {
    const stored = getStoredTheme();
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark") ? "dark" : "light";
    }
    return "light";
  });
  const [unreadCount, setUnreadCount] = React.useState(0);
  const searchContainerRef = React.useRef<HTMLDivElement | null>(null);

  const displayName = authUser?.name ?? "User";
  const displayRole = authUser?.role ?? "USER";
  const isAdmin = authUser?.role === "ADMIN";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const displayRoleLabel = React.useMemo(() => {
    if (displayRole === "OWNER_ADMIN" || displayRole === "ADMIN") {
      return t("signin.admin");
    }
    if (displayRole === "CASHIER") return t("signin.cashier");
    if (displayRole === "TECHNICIAN") return t("signin.technician");
    return displayRole;
  }, [displayRole, t]);

  const mapToInventoryRow = React.useCallback((item: InventoryListItem): InventoryRow => {
    return {
      id: String(item.id),
      itemName: `${item.brand} ${item.model}`.trim(),
      brand: item.brand,
      model: item.model,
      imei: item.imei,
      serialNumber: item.serialNumber ?? null,
      purchaseId: item.purchaseId ?? null,
      saleId: item.saleId ?? null,
      condition: item.condition,
      status: item.status,
      cost: Number(item.cost),
      expectedPrice:
        item.expectedSalePrice === null || item.expectedSalePrice === undefined
          ? undefined
          : Number(item.expectedSalePrice),
      profitEst:
        item.expectedSalePrice === null || item.expectedSalePrice === undefined
          ? undefined
          : Number(item.expectedSalePrice) - Number(item.cost),
      purchaseCost: Number(item.purchaseCost),
      repairCost: Number(item.repairCost),
      knownIssues: item.knownIssues ?? null,
    };
  }, []);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setRecommendations([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await listInventoryItems({
          page: 1,
          limit: 8,
          q: query.trim(),
        });
        setRecommendations(response.data);
      } catch (requestError) {
        setRecommendations([]);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Failed to load recommendations.",
        );
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query]);

  React.useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node;
      if (!searchContainerRef.current?.contains(target)) {
        setIsSuggestionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const showSuggestions = isSuggestionsOpen && query.trim().length >= 2;

  function handlePickItem(item: InventoryListItem) {
    setSelectedItem(mapToInventoryRow(item));
    setDetailsOpen(true);
    setIsSuggestionsOpen(false);
  }

  function handleThemeToggle(event: React.MouseEvent<HTMLButtonElement>) {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    const next = isCurrentlyDark ? "light" : "dark";
    const rect = event.currentTarget.getBoundingClientRect();
    setTheme(next, {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
    setThemeState(next);
  }

  React.useEffect(() => {
    if (!isAdmin) {
      setUnreadCount(0);
      return;
    }

    let active = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await listSupportRequests({
          page: 1,
          limit: 1,
          status: "unread",
        });
        if (active) {
          setUnreadCount(response.meta.total);
        }
      } catch {
        if (active) {
          setUnreadCount(0);
        }
      }
    };

    void fetchUnreadCount();
    const interval = window.setInterval(() => void fetchUnreadCount(), 20000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isAdmin]);

  return (
    <>
      <header className={cn("w-full", className)}>
      <div className="mx-auto flex w-full flex-wrap items-start gap-3 rounded-3xl border border-muted/40 bg-muted/30 px-4 py-3 shadow-sm lg:flex-nowrap lg:items-center">
        {/* Mobile hamburger */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="md:hidden h-11 w-11 rounded-2xl bg-white border border-muted/40 hover:bg-white"
          onClick={onOpenMobileSidebar}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Search */}
        <div className="order-3 flex basis-full items-center gap-3 lg:order-none lg:basis-auto lg:flex-1">
          <div ref={searchContainerRef} className="relative w-full max-w-none sm:max-w-[520px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsSuggestionsOpen(true)}
              placeholder={t("topbar.searchPlaceholder")}
              className={cn(
                "h-11 rounded-2xl bg-white pl-9 pr-14",
                "border-muted/40 focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <kbd className="inline-flex items-center gap-1 rounded-xl border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
                ⌘<span className="text-[11px]">F</span>
              </kbd>
            </div>

            {showSuggestions ? (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border bg-background shadow-xl">
                {loading ? (
                  <div className="px-3 py-3 text-sm text-muted-foreground">
                    {t("topbar.searching")}
                  </div>
                ) : null}

                {!loading && error ? (
                  <div className="px-3 py-3 text-sm text-rose-600">{error}</div>
                ) : null}

                {!loading && !error && recommendations.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-muted-foreground">
                    {t("topbar.noPhones")}
                  </div>
                ) : null}

                {!loading && !error && recommendations.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto py-1">
                    {recommendations.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-start justify-between gap-3 px-3 py-2 text-left hover:bg-muted/50"
                        onClick={() => handlePickItem(item)}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {item.brand} {item.model}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            IMEI: {item.imei}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{item.status}</div>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        {/* Right actions */}
        <div className="order-2 ml-auto flex items-center gap-2 lg:order-none lg:ml-0">
          <Select value={language} onValueChange={(value) => setLanguage(value as "en" | "uz")}>
            <SelectTrigger className="h-10 w-[76px] rounded-2xl border-muted/40 bg-white dark:bg-muted/20 dark:border-muted/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="uz">UZ</SelectItem>
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            size="icon"
          className="h-10 w-10 rounded-2xl border-muted/40 bg-white dark:bg-muted/20 dark:border-muted/30"
          onClick={(event) => handleThemeToggle(event)}
          aria-label={t("topbar.toggleTheme")}
          title={theme === "dark" ? t("topbar.switchToLight") : t("topbar.switchToDark")}
        >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {isAdmin ? (
            <Link to="/messages">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative h-10 w-10 rounded-2xl border-muted/40 bg-white dark:bg-muted/20 dark:border-muted/30"
                aria-label={t("topbar.messages")}
                title={t("topbar.messages")}
              >
                <MessageSquare className="h-4 w-4" />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </Button>
            </Link>
          ) : null}

          {/* User -> link to profile */}
          <Link
              to="/user"
              className="group flex items-center gap-3 rounded-2xl border border-muted/40 bg-white px-3 py-2 transition hover:bg-muted/10 dark:bg-muted/20 dark:border-muted/30 dark:hover:bg-muted/30"
>
  <Avatar className="h-9 w-9">
    <AvatarFallback>{initials || "U"}</AvatarFallback>
  </Avatar>

  <div className="hidden sm:block leading-tight">
    <div className="text-sm font-semibold">{displayName}</div>
    <div className="text-xs text-muted-foreground">{displayRoleLabel}</div>
  </div>
</Link>
        </div>
      </div>
      </header>

      <InventoryDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        item={selectedItem}
        canManage={false}
        onEdit={() => {}}
        onCreateSale={() => {}}
      />
    </>
  );
}
