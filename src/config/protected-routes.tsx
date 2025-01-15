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
import TeamDiscussions from "@/pages/TeamDiscussions";
import Leaderboard from "@/pages/LeaderBoard";
import Elevate from "@/pages/Elevate";
import PlatformDetail from "@/pages/PlatformDetail";
import VisionBoard from "@/pages/tools/VisionBoard";
import SignatureGenerator from "@/pages/tools/SignatureGenerator";
import TreeGenerator from "@/pages/tools/TreeGenerator";
import BioGenerator from "@/pages/tools/BioGenerator";
import QrCodeGenerator from "@/pages/tools/QrCodeGenerator";

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
    path: "/team/:teamSlug/discussions",
    element: <TeamDiscussions />,
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
    path: "/tools/vision-board",
    element: <VisionBoard />,
  },
  {
    path: "/tools/signature-generator",
    element: <SignatureGenerator />,
  },
  {
    path: "/tools/tree-generator",
    element: <TreeGenerator />,
  },
  {
    path: "/tools/bio-generator",
    element: <BioGenerator />,
  },
  {
    path: "/tools/qr-code-generator",
    element: <QrCodeGenerator />,
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
];

export default protectedRoutes;
