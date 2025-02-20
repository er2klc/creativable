
import { MessageSquare, Bell, CalendarIcon, FolderOpenIcon, Users, Settings, Trophy, BarChart3 } from "lucide-react";
import type { Snap } from "../types/snaps";
import { MembersCard } from "../snap-cards/MembersCard";
import React from "react";

export const getRegularSnaps = (teamId: string, teamSlug: string): Snap[] => [
  {
    id: "calendar",
    icon: React.createElement(CalendarIcon, { className: "h-8 w-8" }),
    label: "Team-Kalender",
    description: "Plane und verwalte Team-Termine",
    gradient: "from-green-500 to-green-600"
  },
  {
    id: "posts",
    icon: React.createElement(MessageSquare, { className: "h-8 w-8" }),
    label: "Community",
    description: "Diskutiere und tausche dich aus",
    gradient: "from-blue-500 to-blue-600"
  },
  {
    id: "members",
    icon: React.createElement(Users, { className: "h-8 w-8" }),
    label: "Mitglieder",
    description: "Alle Team-Mitglieder im Überblick",
    gradient: "from-orange-500 to-orange-600",
    component: MembersCard
  },
  {
    id: "news",
    icon: React.createElement(Bell, { className: "h-8 w-8" }),
    label: "News & Updates",
    description: "Bleiben Sie über wichtige Updates informiert",
    gradient: "from-purple-500 to-purple-600"
  },
  {
    id: "files",
    icon: React.createElement(FolderOpenIcon, { className: "h-8 w-8" }),
    label: "Dateien",
    description: "Verwalten Sie gemeinsame Dokumente",
    gradient: "from-yellow-500 to-yellow-600"
  },
  {
    id: "leaderboard",
    icon: React.createElement(Trophy, { className: "h-8 w-8" }),
    label: "Leaderboard",
    description: "Team Rangliste & Aktivitäten",
    gradient: "from-red-500 to-red-600"
  }
];

export const getAdminSnaps = (): Snap[] => [
  {
    id: "member-management",
    icon: React.createElement(Users, { className: "h-8 w-8" }),
    label: "Mitgliederverwaltung",
    description: "Verwalte Mitglieder und Punkte",
    gradient: "from-indigo-500 to-indigo-600"
  },
  {
    id: "settings",
    icon: React.createElement(Settings, { className: "h-8 w-8" }),
    label: "Einstellungen",
    description: "Team-Einstellungen verwalten",
    gradient: "from-pink-500 to-pink-600"
  },
  {
    id: "analytics",
    icon: React.createElement(BarChart3, { className: "h-8 w-8" }),
    label: "Analyse",
    description: "Team Statistiken & Analysen",
    gradient: "from-indigo-500 to-indigo-600"
  }
];
