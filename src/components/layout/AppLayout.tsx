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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { 
  LayoutGrid, 
  Users, 
  MessageSquare, 
  Calendar, 
  BarChart, 
  Settings 
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSettings } from "@/hooks/use-settings";

const navigationItems = [
  { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
  { title: "Kontakt", icon: Users, url: "/contacts" },
  { title: "Nachrichten", icon: MessageSquare, url: "/messages" },
  { title: "Kalender", icon: Calendar, url: "/calendar" },
  { title: "Berichte", icon: BarChart, url: "/reports" },
  { title: "Einstellungen", icon: Settings, url: "/settings" },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {settings?.language === "en" ? "Navigation" : "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    onClick={() => navigate(item.url)}
                    className={location.pathname === item.url ? "bg-accent" : ""}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
        <main className="flex-1 p-8 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <SidebarTrigger />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};