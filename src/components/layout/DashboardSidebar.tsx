import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
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
    <Sidebar className="fixed group w-[60px] hover:w-[240px] transition-all duration-300 ease-in-out z-50">
      <div className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-xl shadow-xl" />
      <SidebarContent className="flex flex-col h-full relative overflow-y-auto no-scrollbar">
        {/* Fixed Logo Container */}
        <div className="absolute top-0 left-0 w-[60px] h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png')] opacity-10 blur-2xl scale-150" />
          <img 
            src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
            alt="Logo" 
            className="h-8 w-8 relative z-10"
          />
        </div>

        {/* Main Content with Offset for Fixed Logo */}
        <div className="pt-16 flex-1 overflow-y-auto no-scrollbar">
          {/* Gradient Separator */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />

          <SidebarGroup>
            <div className="flex items-center px-4 py-1.5">
              <SidebarGroupLabel className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/70">
                Persönlich
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {personalItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 relative px-4 py-2 text-gray-300 hover:text-white transition-all duration-200 group/item">
                        <item.icon className="h-[20px] w-[20px] shrink-0 group-hover/item:h-[18px] group-hover/item:w-[18px] transition-all duration-300" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm text-white">
                          {item.title}
                        </span>
                        {item.badge && unreadCount > 0 && (
                          <Badge variant="destructive" className="absolute right-2 -top-1 opacity-0 group-hover:opacity-100">
                            {unreadCount}
                          </Badge>
                        )}
                        <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 group-hover/item:w-full transition-all duration-300" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-2 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Teams & Groups Section */}
          <SidebarGroup>
            <div className="flex items-center px-4 py-1.5">
              <SidebarGroupLabel className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/70">
                Teams & Gruppen
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {teamItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white transition-all duration-200 group/item">
                        <item.icon className="h-[20px] w-[20px] shrink-0 group-hover/item:h-[18px] group-hover/item:w-[18px] transition-all duration-300" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm text-white">
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

          <SidebarSeparator className="my-2 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Analysis & Tools Section */}
          <SidebarGroup>
            <div className="flex items-center px-4 py-1.5">
              <SidebarGroupLabel className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/70">
                Analyse & Tools
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {analysisItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white transition-all duration-200 group/item">
                        <item.icon className="h-[20px] w-[20px] shrink-0 group-hover/item:h-[18px] group-hover/item:w-[18px] transition-all duration-300" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm text-white">
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

          <SidebarSeparator className="my-2 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Legal Section */}
          <SidebarGroup>
            <div className="flex items-center px-4 py-1.5">
              <SidebarGroupLabel className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/70">
                Rechtliches
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {legalItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-white transition-all duration-200 group/item">
                        <item.icon className="h-[20px] w-[20px] shrink-0 group-hover/item:h-[18px] group-hover/item:w-[18px] transition-all duration-300" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm text-white">
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
        </div>

        {/* Version number - visible when collapsed */}
        <div className="sticky bottom-0 left-0 w-[60px] px-4 py-2 text-sm text-gray-400 flex items-center justify-center group-hover:w-full group-hover:justify-start border-t border-white/10 bg-[#0A0A0A]/95">
          <span className="whitespace-nowrap">
            {APP_VERSION}
          </span>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};