
import Unity from "@/pages/Unity";
import Elevate from "@/pages/Elevate";
import TeamDetail from "@/pages/TeamDetail";
import PlatformDetail from "@/pages/PlatformDetail";
import LeaderBoard from "@/pages/LeaderBoard";
import TeamPulse from "@/pages/TeamPulse";
import { PostsAndDiscussions } from "@/components/teams/posts/PostsAndDiscussions";
import TeamCalendar from "@/pages/TeamCalendar";

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
    path: "/unity/team/:teamSlug/posts",
    element: <PostsAndDiscussions />,
    label: "Team Posts",
  },
  {
    path: "/unity/team/:teamSlug/calendar",
    element: <TeamCalendar />,
    label: "Team Calendar",
  },
  {
    path: "/unity/team/:teamSlug/pulse",
    element: <TeamPulse />,
    label: "Team Pulse",
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
