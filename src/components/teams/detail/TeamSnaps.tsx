import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bell, CalendarIcon, FolderOpenIcon, BarChart, Users, Settings, X, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TeamSnapsProps {
  isAdmin: boolean;
  isManaging: boolean;
  hiddenSnaps: string[];
  setHiddenSnaps: (snaps: string[]) => void;
}

export const TeamSnaps = ({ isAdmin, isManaging, hiddenSnaps, setHiddenSnaps }: TeamSnapsProps) => {
  const regularSnaps = [
    {
      id: "posts",
      icon: <MessageSquare className="h-8 w-8" />,
      label: "Diskussionen & Beiträge",
      description: "Teilen Sie Ideen und Diskussionen mit Ihrem Team",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "news",
      icon: <Bell className="h-8 w-8" />,
      label: "News & Updates",
      description: "Bleiben Sie über wichtige Updates informiert",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      id: "calendar",
      icon: <CalendarIcon className="h-8 w-8" />,
      label: "Kalender",
      description: "Planen Sie Termine und Events",
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "files",
      icon: <FolderOpenIcon className="h-8 w-8" />,
      label: "Dateien",
      description: "Verwalten Sie gemeinsame Dokumente",
      gradient: "from-yellow-500 to-yellow-600",
    },
  ];

  const adminSnaps = [
    {
      id: "members",
      icon: <Users className="h-8 w-8" />,
      label: "Mitglieder",
      description: "Verwalten Sie Teammitglieder",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      id: "analytics",
      icon: <BarChart className="h-8 w-8" />,
      label: "Statistiken",
      description: "Analysieren Sie Team-Aktivitäten",
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      id: "settings",
      icon: <Settings className="h-8 w-8" />,
      label: "Einstellungen",
      description: "Konfigurieren Sie Team-Einstellungen",
      gradient: "from-gray-500 to-gray-600",
    },
  ];

  const visibleRegularSnaps = regularSnaps.filter(snap => !hiddenSnaps.includes(snap.id));
  const visibleAdminSnaps = isAdmin ? adminSnaps.filter(snap => !hiddenSnaps.includes(snap.id)) : [];
  const hiddenRegularSnaps = regularSnaps.filter(snap => hiddenSnaps.includes(snap.id));
  const hiddenAdminSnaps = isAdmin ? adminSnaps.filter(snap => hiddenSnaps.includes(snap.id)) : [];

  return (
    <div className="space-y-8">
      {visibleRegularSnaps.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleRegularSnaps.map((snap) => (
              <Card
                key={snap.id}
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
              >
                {isManaging && (
                  <button
                    onClick={() => setHiddenSnaps([...hiddenSnaps, snap.id])}
                    className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${snap.gradient}`} />
                <div className="relative p-6 space-y-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg ${snap.gradient}`}>
                    <div className="text-white">
                      {snap.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{snap.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {snap.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isAdmin && visibleAdminSnaps.length > 0 && (
        <div className="space-y-4">
          <Separator className="my-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleAdminSnaps.map((snap) => (
              <Card
                key={snap.id}
                className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
              >
                <Badge 
                  variant="secondary" 
                  className="absolute top-2 right-2 z-10"
                >
                  Admin
                </Badge>
                {isManaging && (
                  <button
                    onClick={() => setHiddenSnaps([...hiddenSnaps, snap.id])}
                    className="absolute top-2 right-16 z-10 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${snap.gradient}`} />
                <div className="relative p-6 space-y-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg ${snap.gradient}`}>
                    <div className="text-white">
                      {snap.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{snap.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {snap.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {isManaging && (hiddenRegularSnaps.length > 0 || hiddenAdminSnaps.length > 0) && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...hiddenRegularSnaps, ...hiddenAdminSnaps].map((snap) => (
              <Card
                key={snap.id}
                className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                onClick={() => setHiddenSnaps(hiddenSnaps.filter(id => id !== snap.id))}
              >
                {snap.id === "members" && (
                  <Badge 
                    variant="secondary" 
                    className="absolute top-2 right-2 z-10"
                  >
                    Admin
                  </Badge>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${snap.gradient}`} />
                <div className="relative p-6 space-y-4 opacity-50">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg ${snap.gradient}`}>
                    <div className="text-white">
                      {snap.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{snap.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {snap.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};