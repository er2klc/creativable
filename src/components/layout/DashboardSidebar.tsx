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
    <Sidebar className="fixed group w-[60px] hover:w-64 transition-all duration-300 ease-in-out z-50 bg-[#1A1F2C]/95 backdrop-blur-xl shadow-xl">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo with blur effect */}
        <div className="relative flex items-center justify-center p-4 mb-2 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png')] opacity-10 blur-2xl scale-150" />
          <img 
            src="/lovable-uploads/364f2d81-57ce-4e21-a182-252ddb5cbe50.png" 
            alt="Logo" 
            className="h-8 w-8 relative z-10"
          />
        </div>

        {/* Gradient Separator */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent mb-4" />

        <div className="flex-1 overflow-y-auto">
          <SidebarGroup>
            <div className="flex items-center px-4 py-1.5">
              <SidebarGroupLabel className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Persönlich
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {personalItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 relative px-4 py-2 text-gray-300 hover:text-purple-300 hover:bg-white/5 rounded-lg transition-all duration-200 group/item">
                        <item.icon className="h-5 w-5 shrink-0 group-hover:h-[18px] group-hover:w-[18px] transition-all duration-300" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm">
                          {item.title}
                        </span>
                        {item.badge && unreadCount > 0 && (
                          <Badge variant="destructive" className="absolute right-2 -top-1 opacity-0 group-hover:opacity-100">
                            {unreadCount}
                          </Badge>
                        )}
                        <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50 group-hover/item:w-full transition-all duration-300" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-2 h-px w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

          <SidebarGroup>
            <div className="flex items-center px-4 py-1.5">
              <SidebarGroupLabel className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Teams & Gruppen
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {teamItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-purple-300 hover:bg-white/5 rounded-lg transition-all duration-200 group/item">
                        <item.icon className="h-5 w-5 shrink-0 group-hover:h-[18px] group-hover:w-[18px] transition-all duration-300" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm">
                          {item.title}
                        </span>
                        <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50 group-hover/item:w-full transition-all duration-300" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-2 h-px w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

          <SidebarGroup>
            <div className="flex items-center px-4 py-1.5">
              <SidebarGroupLabel className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Analyse & Tools
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {analysisItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-purple-300 hover:bg-white/5 rounded-lg transition-all duration-200 group/item">
                        <item.icon className="h-5 w-5 shrink-0 group-hover:h-[18px] group-hover:w-[18px] transition-all duration-300" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm">
                          {item.title}
                        </span>
                        <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50 group-hover/item:w-full transition-all duration-300" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-2 h-px w-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

          <SidebarGroup>
            <div className="flex items-center px-4 py-1.5">
              <SidebarGroupLabel className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Rechtliches
              </SidebarGroupLabel>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {legalItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 px-4 py-2 text-gray-300 hover:text-purple-300 hover:bg-white/5 rounded-lg transition-all duration-200 group/item">
                        <item.icon className="h-5 w-5 shrink-0 group-hover:h-[18px] group-hover:w-[18px] transition-all duration-300" />
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap text-sm">
                          {item.title === "Datenlöschung" ? "Datenlöschung" : item.title}
                        </span>
                        <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50 group-hover/item:w-full transition-all duration-300" />
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className="px-4 py-2 text-sm text-gray-400 border-t border-gray-800">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-purple-300">
            Version {APP_VERSION}
          </span>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};