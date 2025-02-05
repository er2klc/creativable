
import Unity from "@/pages/Unity";
import Elevate from "@/pages/Elevate";
import TeamDetail from "@/pages/TeamDetail";
import PlatformDetail from "@/pages/PlatformDetail";
import LeaderBoard from "@/pages/LeaderBoard";

export const platformRoutes = [
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
];
