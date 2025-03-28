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
import { useElevateProgress } from "./SidebarItems";

interface MenuItem {
  title: string;
  icon: LucideIcon;
  url: string;
  badge?: boolean | number;
  showProgress?: boolean;
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
  const { data: elevateProgress = 0 } = useElevateProgress();

  return (
    <SidebarGroup>
      <div className="flex items-center px-4 py-1.5">
        <SidebarGroupLabel className={`transition-opacity duration-300 text-white/70 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
          {title}
        </SidebarGroupLabel>
      </div>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url} className="flex items-center gap-3 relative px-4 py-5 text-gray-300 bg-transparent hover:text-white hover:bg-transparent focus:bg-transparent active:bg-transparent transition-all duration-200 group/item">
                  <div className="relative">
                    {item.showProgress ? (
                    <div className="relative pr-4 flex items-center justify-center w-8 h-8">
  <svg 
    className="absolute w-full h-full" viewBox="0 0 36 36">
    <path
      d="M18 2.0845
        a 15.9155 15.9155 0 0 1 0 31.831
        a 15.9155 15.9155 0 0 1 0 -31.831"
      fill="none"
      stroke="#444"
      strokeWidth="2"
      strokeDasharray="100, 100"
    />
    <path
      d="M18 2.0845
        a 15.9155 15.9155 0 0 1 0 31.831
        a 15.9155 15.9155 0 0 1 0 -31.831"
      fill="none"
      stroke="#F1C232"
      strokeWidth="2"
      strokeDasharray={`${elevateProgress}, 100`}
    />
  </svg>
  <item.icon
    className="absolute top-1/2 transform -translate-x-[calc(50%-11px)] -translate-y-1/2 h-5 w-5"
  />
  {elevateProgress > 0 && (
    <Badge 
      variant="outline" 
      className="absolute -top-2 -right-1 text-[11px] min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-[#161616] text-[#F1C232] border-none"
    >
      {elevateProgress}%
    </Badge>
  )}
</div>
                    ) : (
                      <div className="relative">
                        <item.icon className={`shrink-0 transition-all duration-300 ${isExpanded ? 'h-[21px] w-[21px]' : 'h-[21px] w-[21px]'} group-hover/item:h-[28px] group-hover/item:w-[28px]`} /> 
                        {typeof item.badge === 'number' && (
                          <Badge 
                            variant="outline" 
                            className={`absolute -top-2 -right-2 text-xs min-w-[18px] h-[18px] flex items-center justify-center px-1 ${
                              item.title === "Kalender" 
                                ? "bg-[#161616] text-[#92ff86] border-none" 
                                : "bg-[#161616] text-[#86edff] border-none"
                            }`}
                          >
                            {item.badge}
                          </Badge>
                        )}
                        {item.badge === true && unreadCount > 0 && (
                          <Badge 
                            variant="outline" 
                            className="absolute -top-2 -right-2 text-xs min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-[#161616] text-[#ff9393] border-none"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
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
