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
  Menu,
  Plus,
  Send,
  Search,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

const QuickActions = () => {
  return (
    <div className="flex gap-4 mb-8">
      <Button className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Neuer Lead
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <Send className="h-4 w-4" />
        Nachricht senden
      </Button>
      <Button variant="outline" className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Kalender öffnen
      </Button>
    </div>
  );
};

const PhaseProgress = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Lead-Phasen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Erstkontakt</span>
            <span>45%</span>
          </div>
          <Progress value={45} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Follow-up</span>
            <span>35%</span>
          </div>
          <Progress value={35} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Abschluss</span>
            <span>20%</span>
          </div>
          <Progress value={20} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

const SearchBar = () => {
  return (
    <div className="relative mb-8">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        placeholder="Lead suchen..."
        className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
      />
    </div>
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

            <QuickActions />
            <SearchBar />
            <PhaseProgress />

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

            <div className="fixed bottom-4 right-4">
              <Button variant="outline" size="icon" className="rounded-full">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;