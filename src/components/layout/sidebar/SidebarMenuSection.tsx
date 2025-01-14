import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SidebarGroup, SidebarGroupContent, SidebarGroupTitle } from "@/components/ui/sidebar";

interface SidebarMenuSectionProps {
  title: string;
  items: {
    name: string;
    path: string;
    icon: React.ElementType;
  }[];
  isExpanded: boolean;
  unreadCount?: number;
}

export const SidebarMenuSection = ({ 
  title, 
  items, 
  isExpanded,
  unreadCount = 0 
}: SidebarMenuSectionProps) => {
  const location = useLocation();

  return (
    <SidebarGroup>
      {isExpanded && (
        <SidebarGroupTitle>
          {title}
        </SidebarGroupTitle>
      )}
      <SidebarGroupContent>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const showUnreadBadge = item.path === '/messages' && unreadCount > 0;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors relative group",
                isActive && "text-white"
              )}
            >
              <Icon 
                className={cn(
                  "shrink-0 transition-all duration-300",
                  isExpanded ? "h-[30px] w-[30px] group-hover:h-[25px] group-hover:w-[25px]" : "h-[40px] w-[40px] group-hover:h-[25px] group-hover:w-[25px]"
                )} 
              />
              {isExpanded && <span>{item.name}</span>}
              {showUnreadBadge && (
                <span className="absolute top-1 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
              <div className={cn(
                "absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 transition-all duration-300",
                isActive ? "w-full" : "group-hover:w-full"
              )} />
            </Link>
          );
        })}
      </SidebarGroupContent>
    </SidebarGroup>
  );
};