import { SidebarContent } from "./sidebar-content";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  className?: string;
};

export function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  return (
    <aside className={`hidden md:flex h-full p-4 ${className ?? ""}`}>
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}
