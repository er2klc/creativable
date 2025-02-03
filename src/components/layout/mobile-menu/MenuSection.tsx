import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  onNavigate: (path: string) => void;
}

export function MenuSection({ title, items, onNavigate }: MenuSectionProps) {
  const location = useLocation();

  return (
    <div className="px-4 py-2">
      <h3 className="text-sm text-white/70 px-4 py-1.5">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors relative group",
              location.pathname === item.path && "text-white"
            )}
          >
            <item.icon className="h-[25px] w-[25px] shrink-0 group-hover:h-[23px] group-hover:w-[23px] transition-all duration-300" />
            <span>{item.name}</span>
            <div className={cn(
              "absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 transition-all duration-300",
              location.pathname === item.path ? "w-full" : "group-hover:w-full"
            )} />
          </button>
        ))}
      </div>
    </div>
  );
}