import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface SidebarHeaderProps {
  onToggleSidebar: () => void;
}

export const SidebarHeader = ({ onToggleSidebar }: SidebarHeaderProps) => {
  return (
    <div className="flex h-16 items-center px-4 border-b">
      <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <div className="flex items-center justify-center lg:justify-start lg:px-2">
        <span className="font-bold">Lovable</span>
      </div>
    </div>
  );
};