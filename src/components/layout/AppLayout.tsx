import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
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
} from "lucide-react";

const navigationItems = [
  { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
  { title: "Kontakt", icon: Users, url: "/leads" },
  { title: "Nachrichten", icon: MessageSquare, url: "/messages" },
  { title: "Kalender", icon: Calendar, url: "/calendar" },
  { title: "Berichte", icon: BarChart, url: "/reports" },
  { title: "Einstellungen", icon: Settings, url: "/settings" },
];

const APP_VERSION = "0.1";

const DashboardSidebar = () => {
  const { toggleSidebar, state } = useSidebar();
  const Icon = state === "collapsed" ? PanelLeft : PanelLeftClose;
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <button
              className="p-1 hover:bg-sidebar-accent rounded-md transition-colors text-sidebar-foreground group-data-[collapsible=icon]:bg-sidebar group-data-[collapsible=icon]:hover:bg-sidebar-accent"
              onClick={toggleSidebar}
            >
              <Icon className="h-4 w-4" />
            </button>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto pt-4 px-4 text-sm text-muted-foreground border-t">
          Version {APP_VERSION}
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};