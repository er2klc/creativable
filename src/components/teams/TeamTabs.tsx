import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Bell, Calendar, FolderOpen, Users, Settings, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  isAdmin?: boolean;
}

export function TeamTabs({ children, defaultValue = "posts", isAdmin = false }: TeamTabsProps) {
  const tabs = [
    {
      id: "posts",
      icon: <MessageSquare className="h-6 w-6" />,
      label: "Beiträge",
      adminOnly: false,
    },
    {
      id: "news",
      icon: <Bell className="h-6 w-6" />,
      label: "News",
      adminOnly: false,
    },
    {
      id: "calendar",
      icon: <Calendar className="h-6 w-6" />,
      label: "Kalender",
      adminOnly: false,
    },
    {
      id: "files",
      icon: <FolderOpen className="h-6 w-6" />,
      label: "Dateien",
      adminOnly: false,
    },
    {
      id: "members",
      icon: <Users className="h-6 w-6" />,
      label: "Mitglieder",
      adminOnly: true,
    },
    {
      id: "analytics",
      icon: <BarChart className="h-6 w-6" />,
      label: "Statistiken",
      adminOnly: true,
    },
    {
      id: "settings",
      icon: <Settings className="h-6 w-6" />,
      label: "Einstellungen",
      adminOnly: true,
    },
  ];

  const visibleTabs = tabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="grid grid-cols-4 md:grid-cols-7 gap-4 bg-transparent p-4">
        {visibleTabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl transition-all",
              "data-[state=active]:bg-primary/10 hover:bg-accent",
              "min-h-[100px] aspect-square",
              "border border-border shadow-sm",
              "group"
            )}
          >
            <div className="p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-colors">
              {tab.icon}
            </div>
            <span className="text-xs font-medium">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
}