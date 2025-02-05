
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import Messages from "@/pages/Messages";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import Tools from "@/pages/Tools";
import VisionBoard from "@/pages/VisionBoard";
import BioGenerator from "@/pages/BioGenerator";
import TreeGenerator from "@/pages/TreeGenerator";
import TodoList from "@/pages/TodoList";
import Unity from "@/pages/Unity";
import Elevate from "@/pages/Elevate";
import TeamDetail from "@/pages/TeamDetail";
import PlatformDetail from "@/pages/PlatformDetail";
import SignatureGenerator from "@/pages/SignatureGenerator";
import LeaderBoard from "@/pages/LeaderBoard";
import Admin from "@/pages/Admin";
import Pool from "@/pages/Pool";

export const protectedRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
    label: "Dashboard",
  },
  {
    path: "/contacts",
    element: <Leads />,
    label: "Contacts",
  },
  {
    path: "/contacts/:leadId",
    element: <LeadDetail />,
    label: "Contact Detail",
  },
  {
    path: "/pool",
    element: <Pool />,
    label: "Pool",
  },
  {
    path: "/pool/:status",
    element: <Pool />,
    label: "Pool Status",
  },
  {
    path: "/messages",
    element: <Messages />,
    label: "Messages",
  },
  {
    path: "/calendar",
    element: <Calendar />,
    label: "Calendar",
  },
  {
    path: "/settings",
    element: <Settings />,
    label: "Settings",
  },
  {
    path: "/tools",
    element: <Tools />,
    label: "Tools",
  },
  {
    path: "/signature-generator",
    element: <SignatureGenerator />,
    label: "Signature Generator",
  },
  {
    path: "/bio-generator",
    element: <BioGenerator />,
    label: "Bio Generator",
  },
  {
    path: "/tree-generator",
    element: <TreeGenerator />,
    label: "Tree Generator",
  },
  {
    path: "/todo",
    element: <TodoList />,
    label: "Todo List",
  },
  {
    path: "/vision-board",
    element: <VisionBoard />,
    label: "Vision Board",
  },
  {
    path: "/unity",
    element: <Unity />,
    label: "Unity",
  },
  {
    path: "/unity/team/:teamSlug",
    element: <TeamDetail />,
    label: "Team Detail",
  },
  {
    path: "/elevate",
    element: <Elevate />,
    label: "Elevate",
  },
  {
    path: "/elevate/modul/:slug",
    element: <PlatformDetail />,
    label: "Platform Detail",
  },
  {
    path: "/leaderboard/:teamId",
    element: <LeaderBoard />,
    label: "Leaderboard",
  },
  {
    path: "/admin",
    element: <Admin />,
    label: "Admin",
  },
];
