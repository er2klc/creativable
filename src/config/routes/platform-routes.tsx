
import Unity from "@/pages/Unity";
import Elevate from "@/pages/Elevate";
import TeamDetail from "@/pages/TeamDetail";
import PlatformDetail from "@/pages/PlatformDetail";
import LeaderBoard from "@/pages/LeaderBoard";
import TeamPulse from "@/pages/TeamPulse";
// Placeholder for posts component
const PostsAndDiscussionsPlaceholder = () => <div>Posts feature temporarily disabled</div>;
import TeamCalendar from "@/pages/TeamCalendar";
import MemberProfile from "@/pages/MemberProfile";
import TeamMembers from "@/pages/TeamMembers";
import MemberManagement from "@/pages/MemberManagement";

export const platformRoutes = [
  {
    path: "/unity",
    element: <Unity />,
    label: "Unity",
  },
  {
    path: "/unity/:teamSlug",
    element: <TeamDetail />,
    label: "Team Detail",
  },
  {
    path: "/unity/:teamSlug/members",
    element: <TeamMembers />,
    label: "Team Members",
  },
  {
    path: "/unity/:teamSlug/members/:memberSlug",
    element: <MemberProfile />,
    label: "Member Profile",
  },
  {
    path: "/unity/:teamSlug/member-management",
    element: <MemberManagement />,
    label: "Member Management",
  },
  {
    path: "/unity/:teamSlug/posts",
    element: <PostsAndDiscussionsPlaceholder />,
    label: "Team Posts",
  },
  {
    path: "/unity/:teamSlug/posts/category/:categorySlug",
    element: <PostsAndDiscussionsPlaceholder />,
    label: "Team Posts Category",
  },
  {
    path: "/unity/:teamSlug/posts/:postSlug",
    element: <PostsAndDiscussionsPlaceholder />,
    label: "Post Detail",
  },
  {
    path: "/unity/:teamSlug/calendar",
    element: <TeamCalendar />,
    label: "Team Calendar",
  },
  {
    path: "/unity/:teamSlug/pulse",
    element: <TeamPulse />,
    label: "Team Pulse",
  },
  {
    path: "/unity/:teamSlug/leaderboard",
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
  },
  // Legacy routes for backward compatibility
  {
    path: "/unity/team/:teamSlug",
    element: <TeamDetail />,
    label: "Team Detail Legacy",
  },
  {
    path: "/unity/team/:teamSlug/*",
    element: <TeamDetail />,
    label: "Team Detail Legacy Wildcard",
  }
];
