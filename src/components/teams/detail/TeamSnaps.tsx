import { MessageSquare, Bell, CalendarIcon, FolderOpenIcon, Users, Settings, Trophy, BarChart3 } from "lucide-react";
import { SnapList } from "./snap-lists/SnapList";
import { AdminSnapList } from "./snap-lists/AdminSnapList";
import { HiddenSnapsList } from "./snap-lists/HiddenSnapsList";
import { useSnapManagement } from "./hooks/useSnapManagement";
import { Snap } from "./types";

interface TeamSnapsProps {
  isAdmin: boolean;
  isManaging: boolean;
  teamId: string;
  onCalendarClick: () => void;
  onSnapClick: (snapId: string) => void;
  onBack: () => void;
  activeSnapView: string | null;
}

export const TeamSnaps = ({ 
  isAdmin, 
  isManaging, 
  teamId, 
  onCalendarClick,
  onSnapClick,
  onBack,
  activeSnapView 
}: TeamSnapsProps) => {
  const { hiddenSnaps, hideSnapMutation, unhideSnapMutation } = useSnapManagement(teamId);

  const regularSnaps: Snap[] = [
    {
      id: "calendar",
      icon: <CalendarIcon className="h-8 w-8" />,
      label: "Team-Kalender",
      description: "Plane und verwalte Team-Termine",
      gradient: "from-green-500 to-green-600",
      onClick: onCalendarClick,
    },
    {
      id: "posts",
      icon: <MessageSquare className="h-8 w-8" />,
      label: "Pulse",
      description: "Für den Herzschlag der Community",
      gradient: "from-blue-500 to-blue-600",
      onClick: () => onSnapClick("posts"),
    },
    {
      id: "news",
      icon: <Bell className="h-8 w-8" />,
      label: "News & Updates",
      description: "Bleiben Sie über wichtige Updates informiert",
      gradient: "from-purple-500 to-purple-600",
      onClick: () => onSnapClick("news"),
    },
    {
      id: "files",
      icon: <FolderOpenIcon className="h-8 w-8" />,
      label: "Dateien",
      description: "Verwalten Sie gemeinsame Dokumente",
      gradient: "from-yellow-500 to-yellow-600",
      onClick: () => onSnapClick("files"),
    },
    {
      id: "leaderboard",
      icon: <Trophy className="h-8 w-8" />,
      label: "Leaderboard",
      description: "Team Rangliste & Aktivitäten",
      gradient: "from-red-500 to-red-600",
      onClick: () => onSnapClick("leaderboard"),
    },
  ];

  const adminSnaps: Snap[] = isAdmin ? [
    {
      id: "members",
      icon: <Users className="h-8 w-8" />,
      label: "Mitglieder",
      description: "Verwalte Team-Mitglieder",
      gradient: "from-orange-500 to-orange-600",
      onClick: () => onSnapClick("members"),
    },
    {
      id: "settings",
      icon: <Settings className="h-8 w-8" />,
      label: "Einstellungen",
      description: "Team-Einstellungen verwalten",
      gradient: "from-pink-500 to-pink-600",
      onClick: () => onSnapClick("settings"),
    },
    {
      id: "analytics",
      icon: <BarChart3 className="h-8 w-8" />,
      label: "Analyse",
      description: "Team Statistiken & Analysen",
      gradient: "from-indigo-500 to-indigo-600",
      onClick: () => onSnapClick("analytics"),
    },
  ] : [];

  const allSnaps = [...regularSnaps, ...adminSnaps];
  const visibleRegularSnaps = regularSnaps.filter(snap => !hiddenSnaps.includes(snap.id));
  const visibleAdminSnaps = adminSnaps.filter(snap => !hiddenSnaps.includes(snap.id));
  const hiddenSnapsList = allSnaps.filter(snap => hiddenSnaps.includes(snap.id));

  return (
    <div className="space-y-8">
      <SnapList
        snaps={visibleRegularSnaps}
        isManaging={isManaging}
        onHide={hideSnapMutation.mutate}
        onBack={onBack}
        activeSnapView={activeSnapView}
      />

      {isAdmin && (
        <AdminSnapList
          snaps={visibleAdminSnaps}
          isManaging={isManaging}
          onHide={hideSnapMutation.mutate}
          onBack={onBack}
          activeSnapView={activeSnapView}
        />
      )}

      {isAdmin && (
        <HiddenSnapsList
          snaps={hiddenSnapsList}
          onUnhide={unhideSnapMutation.mutate}
        />
      )}
    </div>
  );
};