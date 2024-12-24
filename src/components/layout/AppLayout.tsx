import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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