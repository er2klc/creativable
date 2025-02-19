
import Unity from "@/pages/Unity";
import Elevate from "@/pages/Elevate";
import TeamDetail from "@/pages/TeamDetail";
import PlatformDetail from "@/pages/PlatformDetail";
import LeaderBoard from "@/pages/LeaderBoard";
import TeamPulse from "@/pages/TeamPulse";
import { PostsAndDiscussions } from "@/components/teams/posts/PostsAndDiscussions";
import TeamCalendar from "@/pages/TeamCalendar";
import MemberProfile from "@/pages/MemberProfile";
import { MembersCard } from "@/components/teams/detail/snap-cards/MembersCard";

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
    path: "/unity/team/:teamSlug/members",
    element: <MembersCard />,
    label: "Team Members",
  },
  {
    path: "/unity/team/:teamSlug/members/:memberSlug",
    element: <MemberProfile />,
    label: "Member Profile",
  },
  {
    path: "/unity/team/:teamSlug/posts",
    element: <PostsAndDiscussions />,
    label: "Team Posts",
  },
  {
    path: "/unity/team/:teamSlug/posts/category/:categorySlug",
    element: <PostsAndDiscussions />,
    label: "Team Posts Category",
  },
  {
    path: "/unity/team/:teamSlug/posts/:postSlug",
    element: <PostsAndDiscussions />,
    label: "Post Detail",
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
    path: "/unity/team/:teamSlug/leaderboard",
    element: <LeaderBoard />,
    label: "Leaderboard",
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
  }
];

