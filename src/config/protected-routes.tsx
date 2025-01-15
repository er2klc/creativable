import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Leads from "@/pages/Leads";
import Messages from "@/pages/Messages";
import TeamDetail from "@/pages/TeamDetail";
import TeamDiscussions from "@/pages/TeamDiscussions";
import Leaderboard from "@/pages/Leaderboard";

const ProtectedLayout = () => {
  const user = useUser();

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return <Outlet />;
};

export const protectedRoutes = [
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/leads",
        element: <Leads />,
      },
      {
        path: "/messages",
        element: <Messages />,
      },
      {
        path: "/team/:teamSlug",
        element: <TeamDetail />,
      },
      {
        path: "/team/:teamId/discussions",
        element: <TeamDiscussions />,
      },
      {
        path: "/leaderboard/:teamId",
        element: <Leaderboard />,
      },
    ],
  },
] as const;