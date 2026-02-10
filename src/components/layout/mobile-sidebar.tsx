import { Sheet, SheetContent } from "@/components/ui/sheet";
import { SidebarContent } from "./sidebar-content";

type MobileSidebarProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-[320px] sm:w-[360px]">
        <div className="h-full p-4">
          {/* Same Donezo-style UI */}
          <SidebarContent
            collapsed={false}
            onNavigate={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
