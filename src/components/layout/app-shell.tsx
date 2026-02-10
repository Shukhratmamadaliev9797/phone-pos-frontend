import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileSidebar } from "./mobile-sidebar";

export function AppShell() {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="h-screen w-full bg-background overflow-hidden">
      <div className="flex h-full">
        {/* Desktop Sidebar */}
        <aside className="shrink-0">
          <div className="sticky top-0 h-screen">
            <Sidebar
              collapsed={collapsed}
              onToggle={() => setCollapsed((v) => !v)}
            />
          </div>
        </aside>

        {/* Mobile Sidebar (Sheet) */}
        <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

        {/* Content (scrolls) */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* Sticky topbar */}
            <div className="sticky top-0 z-40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-muted/40 shadow-sm">
              <div className="px-4 py-4">
                <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} />
              </div>
            </div>

            <main className="px-4 pb-10 pt-6">
              <div key={location.pathname} className="page-stagger">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
