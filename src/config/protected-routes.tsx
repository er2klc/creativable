import { Navigate, RouteObject } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import Calendar from "@/pages/Calendar";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import Tools from "@/pages/Tools";
import Support from "@/pages/Support";
import Unity from "@/pages/Unity";
import TeamDetail from "@/pages/TeamDetail";
import Leaderboard from "@/pages/LeaderBoard";
import Elevate from "@/pages/Elevate";
import PlatformDetail from "@/pages/PlatformDetail";

const protectedRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/leads",
    element: <Leads />,
  },
  {
    path: "/calendar",
    element: <Calendar />,
  },
  {
    path: "/messages",
    element: <Messages />,
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
    path: "/support",
    element: <Support />,
  },
  {
    path: "/unity",
    element: <Unity />,
  },
  {
    path: "/team/:teamSlug",
    element: <TeamDetail />,
  },
  {
    path: "/leaderboard/:teamId",
    element: <Leaderboard />,
  },
  {
    path: "/elevate",
    element: <Elevate />,
  },
  {
    path: "/platform/:platformId",
    element: <PlatformDetail />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default protectedRoutes;