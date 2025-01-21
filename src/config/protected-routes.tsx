import Pool from "@/pages/Pool";
import Messages from "@/pages/Messages";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import Tools from "@/pages/Tools";
import SignatureGenerator from "@/pages/SignatureGenerator";
import BioGenerator from "@/pages/BioGenerator";
import TreeGenerator from "@/pages/TreeGenerator";
import TodoList from "@/pages/TodoList";
import VisionBoard from "@/pages/VisionBoard";
import Unity from "@/pages/Unity";
import TeamDetail from "@/pages/TeamDetail";
import Elevate from "@/pages/Elevate";
import PlatformDetail from "@/pages/PlatformDetail";
import LeaderBoard from "@/pages/LeaderBoard";
import Admin from "@/pages/Admin";
import LeadDetail from "@/pages/LeadDetail";
import Dashboard from "@/pages/Dashboard";

export const protectedRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/contacts",
    element: <Pool />,
  },
  {
    path: "/contacts/:id",
    element: <LeadDetail />,
  },
  {
    path: "/pool/:status/:leadId",
    element: <LeadDetail />,
  },
  {
    path: "/messages",
    element: <Messages />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/tools",
    element: <Tools />,
  },
  {
    path: "/signature-generator",
    element: <SignatureGenerator />,
  },
  {
    path: "/bio-generator",
    element: <BioGenerator />,
  },
  {
    path: "/tree-generator",
    element: <TreeGenerator />,
  },
  {
    path: "/todo",
    element: <TodoList />,
  },
  {
    path: "/vision-board",
    element: <VisionBoard />,
  },
  {
    path: "/unity",
    element: <Unity />,
  },
  {
    path: "/unity/team/:teamSlug",
    element: <TeamDetail />,
  },
  {
    path: "/elevate",
    element: <Elevate />,
  },
  {
    path: "/elevate/modul/:slug",
    element: <PlatformDetail />,
  },
  {
    path: "/leaderboard/:teamId",
    element: <LeaderBoard />,
  },
  {
    path: "/admin",
    element: <Admin />,
  }
];