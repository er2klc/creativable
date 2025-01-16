import { LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  url: string;
  badge?: boolean | number;
}

interface SidebarMenuSectionProps {
  title: string;
  items: MenuItem[];
  isExpanded: boolean;
  unreadCount?: number;
}

export const SidebarMenuSection = ({ 
  title, 
  items, 
  isExpanded,
  unreadCount = 0
}: SidebarMenuSectionProps) => {
  return (
    <SidebarGroup>
      <div className="flex items-center px-4 py-2">
        <SidebarGroupLabel className={`transition-opacity duration-300 text-white/70 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          {title}
        </SidebarGroupLabel>
      </div>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url} className="flex items-center gap-3 relative px-4 py-3 text-gray-300 bg-transparent hover:text-white hover:bg-transparent focus:bg-transparent active:bg-transparent transition-all duration-200 group/item">
                  <div className="relative">
                    <item.icon className={`shrink-0 transition-all duration-300 ${isExpanded ? 'h-[25px] w-[25px]' : 'h-[25px] w-[25px]'} group-hover/item:h-[30px] group-hover/item:w-[30px]`} /> 
                    {typeof item.badge === 'number' && (
                      <Badge 
                        variant="outline" 
                        className={`absolute -top-2 -right-2 text-xs min-w-[18px] h-[18px] flex items-center justify-center px-1 ${
                          item.title === "Kalender" 
                            ? "bg-green-500/90 text-white border-none" 
                            : "bg-[#9b87f5] text-white border-none"
                        }`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    {item.badge === true && unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 text-xs min-w-[18px] h-[18px] flex items-center justify-center px-1"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </div>
                  <span className={`transition-opacity duration-300 whitespace-nowrap text-sm text-white ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    {item.title}
                  </span>
                  <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 group-hover/item:w-full transition-all duration-300" />
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
