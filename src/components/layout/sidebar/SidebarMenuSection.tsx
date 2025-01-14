import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface MenuItem {
  href: string;
  icon: LucideIcon;
  title: string;
}

interface SidebarMenuSectionProps {
  title: string;
  items: MenuItem[];
  className?: string;
}

export const SidebarMenuSection = ({ title, items, className }: SidebarMenuSectionProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <h4 className="px-2 text-xl font-semibold tracking-tight">{title}</h4>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
};