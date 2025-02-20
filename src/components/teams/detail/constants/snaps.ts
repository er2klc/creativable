
import { MessageSquare, Bell, CalendarIcon, FolderOpenIcon, Users, Settings, Trophy, BarChart3 } from "lucide-react";
import { Snap } from "../types/snaps";
import { MembersCard } from "../snap-cards/MembersCard";

export const getRegularSnaps = (teamId: string, teamSlug: string): Snap[] => [
  {
    id: "calendar",
    icon: <CalendarIcon className="h-8 w-8" />,
    label: "Team-Kalender",
    description: "Plane und verwalte Team-Termine",
    gradient: "from-green-500 to-green-600",
  },
  {
    id: "posts",
    icon: <MessageSquare className="h-8 w-8" />,
    label: "Community",
    description: "Diskutiere und tausche dich aus",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "members",
    icon: <Users className="h-8 w-8" />,
    label: "Mitglieder",
    description: "Alle Team-Mitglieder im Überblick",
    gradient: "from-orange-500 to-orange-600",
    component: MembersCard,
  },
  {
    id: "news",
    icon: <Bell className="h-8 w-8" />,
    label: "News & Updates",
    description: "Bleiben Sie über wichtige Updates informiert",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    id: "files",
    icon: <FolderOpenIcon className="h-8 w-8" />,
    label: "Dateien",
    description: "Verwalten Sie gemeinsame Dokumente",
    gradient: "from-yellow-500 to-yellow-600",
  },
  {
    id: "leaderboard",
    icon: <Trophy className="h-8 w-8" />,
    label: "Leaderboard",
    description: "Team Rangliste & Aktivitäten",
    gradient: "from-red-500 to-red-600",
  },
];

export const getAdminSnaps = (): Snap[] => [
  {
    id: "member-management",
    icon: <Users className="h-8 w-8" />,
    label: "Mitgliederverwaltung",
    description: "Verwalte Mitglieder und Punkte",
    gradient: "from-indigo-500 to-indigo-600",
  },
  {
    id: "settings",
    icon: <Settings className="h-8 w-8" />,
    label: "Einstellungen",
    description: "Team-Einstellungen verwalten",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    id: "analytics",
    icon: <BarChart3 className="h-8 w-8" />,
    label: "Analyse",
    description: "Team Statistiken & Analysen",
    gradient: "from-indigo-500 to-indigo-600",
  },
];
