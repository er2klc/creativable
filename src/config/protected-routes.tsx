import { Navigate, RouteObject } from "react-router-dom";
import { Dashboard } from "@/pages/Dashboard";
import { Leads } from "@/pages/Leads";
import { Calendar } from "@/pages/Calendar";
import { Messages } from "@/pages/Messages";
import { Settings } from "@/pages/Settings";
import { Tools } from "@/pages/Tools";
import { Support } from "@/pages/Support";
import { Unity } from "@/pages/Unity";
import { TeamDetail } from "@/pages/TeamDetail";
import { TeamDiscussions } from "@/pages/TeamDiscussions";
import { Leaderboard } from "@/pages/Leaderboard";
import { Elevate } from "@/pages/Elevate";
import { PlatformDetail } from "@/pages/PlatformDetail";
import { VisionBoard } from "@/pages/tools/VisionBoard";
import { SignatureGenerator } from "@/pages/tools/SignatureGenerator";
import { TreeGenerator } from "@/pages/tools/TreeGenerator";
import { BioGenerator } from "@/pages/tools/BioGenerator";
import { QrCodeGenerator } from "@/pages/tools/QrCodeGenerator";

export const protectedRoutes: RouteObject[] = [
  {
    children: [
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
        path: "/support",
        element: <Support />,
      },
      {
        path: "/unity",
        element: <Unity />,
      },
      {
        path: "/team/:slug",
        element: <TeamDetail />,
      },
      {
        path: "/team/:slug/discussions",
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
        path: "/elevate/:slug",
        element: <PlatformDetail />,
      },
    ],
  },
];