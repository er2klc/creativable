import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { 
  LayoutGrid, 
  Users, 
  MessageSquare, 
  Calendar, 
  BarChart, 
  Settings,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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

const navigationItems = [
  { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
  { title: "Leads", icon: Users, url: "/leads" },
  { title: "Nachrichten", icon: MessageSquare, url: "/messages" },
  { title: "Kalender", icon: Calendar, url: "/calendar" },
  { title: "Berichte", icon: BarChart, url: "/reports" },
  { title: "Einstellungen", icon: Settings, url: "/settings" },
];

const DashboardSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
      </SidebarContent>
    </Sidebar>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUser();
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Auf Wiedersehen!",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler beim Abmelden",
        description: "Bitte versuchen Sie es erneut.",
      });
    }
  };

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Willkommen, {user.email}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Hier ist Ihr aktueller Überblick
                </p>
              </div>
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SidebarTrigger>
                <Button onClick={handleSignOut} variant="outline">
                  Abmelden
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    Leads in Bearbeitung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">45</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    Offene Antworten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">10</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    Abschlussquote
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">25%</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aktuelle Aufgaben</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Keine Aufgaben vorhanden
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>KI-Empfehlungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Keine Empfehlungen verfügbar
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;