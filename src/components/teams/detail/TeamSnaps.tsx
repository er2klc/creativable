import { MessageSquare, Bell, CalendarIcon, FolderOpenIcon, BarChart, Users, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SnapCard } from "./snap-cards/SnapCard";
import { HiddenSnapCard } from "./snap-cards/HiddenSnapCard";

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
              <SnapCard
                key={snap.id}
                snap={snap}
                isManaging={isManaging}
                onHide={(id) => setHiddenSnaps([...hiddenSnaps, id])}
              />
            ))}
          </div>
        </div>
      )}

      {isAdmin && visibleAdminSnaps.length > 0 && (
        <div className="space-y-4">
          <Separator className="my-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleAdminSnaps.map((snap) => (
              <SnapCard
                key={snap.id}
                snap={snap}
                isManaging={isManaging}
                isAdmin={true}
                onHide={(id) => setHiddenSnaps([...hiddenSnaps, id])}
              />
            ))}
          </div>
        </div>
      )}

      {isManaging && (hiddenRegularSnaps.length > 0 || hiddenAdminSnaps.length > 0) && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...hiddenRegularSnaps, ...hiddenAdminSnaps].map((snap) => (
              <HiddenSnapCard
                key={snap.id}
                snap={snap}
                onUnhide={(id) => setHiddenSnaps(hiddenSnaps.filter(s => s !== id))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};