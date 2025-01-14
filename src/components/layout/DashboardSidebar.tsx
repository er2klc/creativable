import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarItems } from "./sidebar/SidebarItems";

interface DashboardSidebarProps {
  isOpen: boolean;
  onToggleSidebar: () => void;
}

export const DashboardSidebar = ({
  isOpen,
  onToggleSidebar,
}: DashboardSidebarProps) => {
  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-background transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        !isOpen && "-translate-x-full"
      )}
    >
      <SidebarHeader onToggleSidebar={onToggleSidebar} />
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarItems />
      </div>
    </div>
  );
};