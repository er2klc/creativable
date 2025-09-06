import { TabsContent } from "@/components/ui/tabs";
import { MessageSquare, Bell, Calendar, FolderOpen, Users, Settings, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

interface TeamTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  isAdmin?: boolean;
}

export function TeamTabs({ children, defaultValue = "posts", isAdmin = false }: TeamTabsProps) {
  const navigate = useNavigate();

  const apps = [
    {
      id: "posts",
      icon: <MessageSquare className="h-8 w-8" />,
      label: "Diskussionen & Beiträge",
      description: "Teilen Sie Ideen und Diskussionen mit Ihrem Team",
      gradient: "from-blue-500 to-blue-600",
      adminOnly: false,
    },
    {
      id: "news",
      icon: <Bell className="h-8 w-8" />,
      label: "News & Updates",
      description: "Bleiben Sie über wichtige Updates informiert",
      gradient: "from-purple-500 to-purple-600",
      adminOnly: false,
    },
    {
      id: "calendar",
      icon: <Calendar className="h-8 w-8" />,
      label: "Kalender",
      description: "Planen Sie Termine und Events",
      gradient: "from-green-500 to-green-600",
      adminOnly: false,
    },
    {
      id: "files",
      icon: <FolderOpen className="h-8 w-8" />,
      label: "Dateien",
      description: "Verwalten Sie gemeinsame Dokumente",
      gradient: "from-yellow-500 to-yellow-600",
      adminOnly: false,
    },
    {
      id: "members",
      icon: <Users className="h-8 w-8" />,
      label: "Mitglieder",
      description: "Verwalten Sie Teammitglieder",
      gradient: "from-pink-500 to-pink-600",
      adminOnly: true,
    },
    {
      id: "analytics",
      icon: <BarChart className="h-8 w-8" />,
      label: "Statistiken",
      description: "Analysieren Sie Team-Aktivitäten",
      gradient: "from-indigo-500 to-indigo-600",
      adminOnly: true,
    },
    {
      id: "settings",
      icon: <Settings className="h-8 w-8" />,
      label: "Einstellungen",
      description: "Konfigurieren Sie Team-Einstellungen",
      gradient: "from-gray-500 to-gray-600",
      adminOnly: true,
    },
  ];

  const visibleApps = apps.filter(app => !app.adminOnly || isAdmin);

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {visibleApps.map((app) => (
          <Card
            key={app.id}
            className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-300",
              "hover:scale-105 hover:shadow-lg",
              "group"
            )}
            onClick={() => navigate(`#${app.id}`)}
          >
            <div className={cn(
              "absolute inset-0 opacity-10 bg-gradient-to-br",
              app.gradient
            )} />
            <div className="relative p-6 space-y-4">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br shadow-lg",
                app.gradient
              )}>
                <div className="text-white">
                  {app.icon}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{app.label}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {app.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {children}
    </div>
  );
}