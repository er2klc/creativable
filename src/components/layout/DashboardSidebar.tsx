import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarGroup,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessagesSquare,
  Settings,
  LogOut,
  Globe2,
  Sparkles,
  GraduationCap,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

const APP_VERSION = "0.3";

const mainNavItems = [
  { title: "Dashboard", icon: <LayoutDashboard />, url: "/dashboard" },
  { title: "Users", icon: <Users />, url: "/users" },
  { title: "Calendar", icon: <Calendar />, url: "/calendar" },
  { title: "Messages", icon: <MessagesSquare />, url: "/messages" },
  { title: "Settings", icon: <Settings />, url: "/settings" },
  { title: "Logout", icon: <LogOut />, url: "/logout" },
];

const moreNavItems = [
  { title: "About", icon: <Globe2 />, url: "/about" },
  { title: "Features", icon: <Sparkles />, url: "/features" },
  { title: "Courses", icon: <GraduationCap />, url: "/courses" },
  { title: "Teams", icon: <Building2 />, url: "/teams" },
];

interface DashboardSidebarProps {
  onExpandChange?: (expanded: boolean) => void;
}

export const DashboardSidebar = ({ onExpandChange }: DashboardSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    onExpandChange?.(isExpanded);
  }, [isExpanded, onExpandChange]);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      return count || 0;
    },
  });

  return (
    <Sidebar 
      className={`fixed group w-[60px] hover:w-[240px] transition-all duration-300 ease-in-out ${isExpanded ? 'w-[240px] z-[100]' : 'z-[40]'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`absolute inset-0 ${isExpanded ? 'w-[240px]' : 'w-[60px]'} bg-[#0A0A0A]/95 backdrop-blur-xl shadow-2xl transition-all duration-300`} />
      <SidebarContent className="flex flex-col h-full relative">
        <div className="sticky top-0 left-0 bg-[#111111]/80 w-full">
          <div className="w-full h-16 flex items-center px-4">
            <div className="absolute inset-0 bg-[url('/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png')] opacity-10 blur-2xl scale-150" />
            <div className="flex items-center gap-3">
              <img
                src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png"
                alt="Logo"
                className="w-8 h-8"
              />
              <span className={`text-lg font-semibold transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                Lovable
              </span>
            </div>
          </div>
        </div>

        <SidebarMenu>
          <SidebarGroup>
            {mainNavItems.map((item) => (
              <SidebarMenuButton
                key={item.title}
                children={
                  <>
                    {item.icon}
                    <span>{item.title}</span>
                    {item.url === "/messages" && unreadCount > 0 && (
                      <Badge variant="default" className="ml-auto">
                        {unreadCount}
                      </Badge>
                    )}
                  </>
                }
              />
            ))}
          </SidebarGroup>

          <SidebarGroup title="Mehr">
            {moreNavItems.map((item) => (
              <SidebarMenuButton
                key={item.title}
                children={
                  <>
                    {item.icon}
                    <span>{item.title}</span>
                  </>
                }
              />
            ))}
          </SidebarGroup>
        </SidebarMenu>

        <div className="mt-auto p-4">
          <div className={`text-xs text-gray-500 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
            Version {APP_VERSION}
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};