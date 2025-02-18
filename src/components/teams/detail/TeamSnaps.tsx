
import { MessageSquare, Bell, CalendarIcon, FolderOpenIcon, Users, Settings, Trophy, BarChart3 } from "lucide-react";
import { SnapList } from "./snap-lists/SnapList";
import { AdminSnapList } from "./snap-lists/AdminSnapList";
import { HiddenSnapsList } from "./snap-lists/HiddenSnapsList";
import { PostSnapsList } from "./snap-lists/PostSnapsList";
import { useSnapManagement } from "./hooks/useSnapManagement";
import { useNavigate, useParams } from "react-router-dom";
import { Snap } from "./types";
import { MembersCard } from "./snap-cards/MembersCard";

interface TeamSnapsProps {
  isAdmin: boolean;
  isManaging: boolean;
  teamId: string;
  teamSlug: string;
  onCalendarClick: () => void;
  onSnapClick: (snapId: string) => void;
  onBack: () => void;
  activeSnapView: string | null;
}

export const TeamSnaps = ({ 
  isAdmin, 
  isManaging, 
  teamId,
  teamSlug,
  onCalendarClick,
  onSnapClick,
  onBack,
  activeSnapView 
}: TeamSnapsProps) => {
  const navigate = useNavigate();
  const { teamSlug: routeTeamSlug } = useParams();
  const { hiddenSnaps, hideSnapMutation, unhideSnapMutation } = useSnapManagement(teamId);

  const currentTeamSlug = teamSlug || routeTeamSlug;

  const handleSnapClick = (snapId: string) => {
    if (!currentTeamSlug) {
      console.error("No team slug available for navigation");
      return;
    }

    console.log("handleSnapClick called with:", { snapId, currentTeamSlug });
    
    if (snapId === "posts") {
      console.log("Navigating to posts with teamSlug:", currentTeamSlug);
      navigate(`/unity/team/${currentTeamSlug}/posts`);
    } else if (snapId === "calendar") {
      onCalendarClick();
    } else if (snapId === "leaderboard") {
      console.log("Navigating to leaderboard with teamSlug:", currentTeamSlug);
      navigate(`/unity/team/${currentTeamSlug}/leaderboard`);
    } else {
      navigate(`/unity/team/${currentTeamSlug}/${snapId}`);
    }
    onSnapClick(snapId);
  };

  const regularSnaps: Snap[] = [
    {
      id: "calendar",
      icon: <CalendarIcon className="h-8 w-8" />,
      label: "Team-Kalender",
      description: "Plane und verwalte Team-Termine",
      gradient: "from-green-500 to-green-600",
      onClick: () => handleSnapClick("calendar"),
    },
    {
      id: "members",
      icon: <Users className="h-8 w-8" />,
      label: "Mitglieder",
      description: "Alle Team-Mitglieder im Überblick",
      gradient: "from-orange-500 to-orange-600",
      component: MembersCard,
      onClick: () => handleSnapClick("members"),
    },
    {
      id: "news",
      icon: <Bell className="h-8 w-8" />,
      label: "News & Updates",
      description: "Bleiben Sie über wichtige Updates informiert",
      gradient: "from-purple-500 to-purple-600",
      onClick: () => handleSnapClick("news"),
    },
    {
      id: "files",
      icon: <FolderOpenIcon className="h-8 w-8" />,
      label: "Dateien",
      description: "Verwalten Sie gemeinsame Dokumente",
      gradient: "from-yellow-500 to-yellow-600",
      onClick: () => handleSnapClick("files"),
    },
    {
      id: "leaderboard",
      icon: <Trophy className="h-8 w-8" />,
      label: "Leaderboard",
      description: "Team Rangliste & Aktivitäten",
      gradient: "from-red-500 to-red-600",
      onClick: () => handleSnapClick("leaderboard"),
    },
  ];

  const adminSnaps: Snap[] = isAdmin ? [
    {
      id: "settings",
      icon: <Settings className="h-8 w-8" />,
      label: "Einstellungen",
      description: "Team-Einstellungen verwalten",
      gradient: "from-pink-500 to-pink-600",
      onClick: () => handleSnapClick("settings"),
    },
    {
      id: "analytics",
      icon: <BarChart3 className="h-8 w-8" />,
      label: "Analyse",
      description: "Team Statistiken & Analysen",
      gradient: "from-indigo-500 to-indigo-600",
      onClick: () => handleSnapClick("analytics"),
    },
  ] : [];

  // Define the variables needed for filtering visible and hidden snaps
  const allSnaps = [...regularSnaps, ...adminSnaps];
  const visibleRegularSnaps = regularSnaps.filter(snap => !hiddenSnaps.includes(snap.id));
  const visibleAdminSnaps = adminSnaps.filter(snap => !hiddenSnaps.includes(snap.id));
  const hiddenSnapsList = allSnaps.filter(snap => hiddenSnaps.includes(snap.id));

  if (!currentTeamSlug) {
    return (
      <div className="p-4 text-center text-red-500">
        Fehler: Team-Slug nicht gefunden
      </div>
    );
  }

  if (activeSnapView === "posts") {
    return <PostSnapsList teamId={teamId} isAdmin={isAdmin} />;
  }

  if (activeSnapView === "members") {
    return <MembersCard teamId={teamId} teamSlug={currentTeamSlug} />;
  }

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
