import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  LayoutGrid, 
  Users, 
  MessageSquare, 
  Calendar,
  CheckSquare,
  BarChart, 
  Settings,
  FileText,
  Shield,
  Globe2,
  Infinity,
  GraduationCap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const APP_VERSION = "0.3";

const personalItems = [
  { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
  { title: "Kontakte", icon: Users, url: "/leads" },
  { 
    title: "Nachrichten", 
    icon: MessageSquare, 
    url: "/messages",
    badge: true 
  },
  { title: "Kalender", icon: Calendar, url: "/calendar" },
  { title: "Todo Liste", icon: CheckSquare, url: "/todo" },
];

const teamItems = [
  { title: "Unity", icon: Infinity, url: "/unity" },
  { title: "Elevate", icon: GraduationCap, url: "/elevate" },
];

const analysisItems = [
  { title: "Berichte", icon: BarChart, url: "/reports" },
  { title: "Einstellungen", icon: Settings, url: "/settings" },
];

const legalItems = [
  { title: "Impressum", icon: FileText, url: "/impressum" },
  { title: "Datenschutz", icon: Shield, url: "/privacy-policy" },
  { title: "Datenlöschung", icon: Globe2, url: "/auth/data-deletion/instagram" },
];

export const DashboardSidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

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
    refetchInterval: 30000,
  });

  return (
    <Sidebar
      className={`fixed top-0 left-0 h-full transition-all duration-300 ${
        isExpanded ? "w-[240px]" : "w-[60px]"
      } bg-[#0A0A0A]/95 backdrop-blur-xl z-[10]`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`absolute inset-0 ${
          isExpanded ? "pointer-events-auto" : "pointer-events-none"
        }`}
      />
      <SidebarContent className="flex flex-col h-full relative">
        <div className="sticky top-0 left-0 z-50 bg-[#111111]/80 w-full">
          <div className="w-full h-16 flex items-center px-4">
            <div className="absolute inset-0 bg-[url('/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png')] opacity-10 blur-2xl scale-150" />
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
                alt="Logo" 
                className="h-8 w-8 relative z-10"
              />
              <span className={`text-white font-medium transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                creativable
              </span>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
          {/* Personal Section */}
          <SidebarGroup>
            <div className="flex items-center px-4 py-1.5">
              <SidebarGroupLabel className={`transition-opacity duration-300 text-white/70 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                Persönlich
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {personalItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 relative px-4 py-2 text-gray-300 hover:text-white">
                        <item.icon className="h-[25px] w-[25px]" />
                        <span className={`text-white transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                          {item.title}
                        </span>
                        {item.badge && unreadCount > 0 && (
                          <Badge variant="destructive">
                            {unreadCount}
                          </Badge>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Other Sections */}
          {/* Teams & Groups Section */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {teamItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white">
                        <item.icon className="h-[25px] w-[25px]" />
                        <span className={`text-white transition-opacity ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                          {item.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
