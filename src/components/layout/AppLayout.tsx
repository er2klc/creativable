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
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutGrid, 
  Users, 
  MessageSquare, 
  Calendar, 
  BarChart, 
  Settings,
  PanelLeftClose,
  PanelLeft,
  FileText,
  Shield,
  Instagram,
  Globe2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const APP_VERSION = "0.2";

const navigationItems = [
  { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
  { title: "Kontakt", icon: Users, url: "/leads" },
  { 
    title: "Nachrichten", 
    icon: MessageSquare, 
    url: "/messages",
    badge: true 
  },
  { title: "Kalender", icon: Calendar, url: "/calendar" },
  { title: "Berichte", icon: BarChart, url: "/reports" },
  { title: "Einstellungen", icon: Settings, url: "/settings" },
];

const legalItems = [
  { title: "Impressum", icon: FileText, url: "/impressum" },
  { title: "Datenschutz", icon: Shield, url: "/privacy-policy" },
  { title: "Instagram Datenlöschung", icon: Instagram, url: "/auth/data-deletion/instagram" },
];

const DashboardSidebar = () => {
  const { toggleSidebar, state } = useSidebar();
  const Icon = state === "collapsed" ? PanelLeft : PanelLeftClose;

  // Query for unread messages count
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
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 relative">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                      {item.badge && unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute right-0 -top-1">
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

        <SidebarSeparator />

        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarGroupLabel>Rechtliches</SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {legalItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto pt-4 px-4 text-sm text-muted-foreground border-t">
          <a href="/changelog" className="hover:text-foreground">
            Version {APP_VERSION}
          </a>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { toggleSidebar, state } = useSidebar();
  const Icon = state === "collapsed" ? PanelLeft : PanelLeftClose;

  return (
    <div className="min-h-screen flex w-full bg-background relative">
      <DashboardSidebar />
      <button
        onClick={toggleSidebar}
        className="absolute left-0 top-2 z-50 p-2 bg-sidebar hover:bg-sidebar-accent rounded-r-md transition-all duration-200 text-sidebar-foreground"
        style={{
          transform: state === "collapsed" ? "translateX(0)" : "translateX(var(--sidebar-width))",
        }}
      >
        <Icon className="h-4 w-4" />
      </button>
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};