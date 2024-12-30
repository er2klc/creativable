import { PanelLeft, PanelLeftClose } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

interface SidebarToggleButtonProps {
  className?: string;
}

export const SidebarToggleButton = ({ className }: SidebarToggleButtonProps) => {
  const { toggleSidebar, state } = useSidebar();
  const Icon = state === "collapsed" ? PanelLeft : PanelLeftClose;

  return (
    <button
      onClick={toggleSidebar}
      className={`fixed left-0 top-2 z-50 p-2 bg-sidebar hover:bg-sidebar-accent rounded-r-md transition-all duration-200 text-sidebar-foreground ${className}`}
      style={{
        transform: state === "collapsed" ? "translateX(0)" : "translateX(var(--sidebar-width))",
      }}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};