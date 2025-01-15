import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Leads from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import Messages from "@/pages/Messages";
import Tasks from "@/pages/Tasks";
import Keywords from "@/pages/Keywords";
import Documents from "@/pages/Documents";
import Templates from "@/pages/Templates";
import Teams from "@/pages/Teams";
import TeamDetail from "@/pages/TeamDetail";
import TeamDiscussions from "@/pages/TeamDiscussions";
import Leaderboard from "@/pages/Leaderboard";

const ProtectedLayout = () => {
  const user = useUser();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export const protectedRoutes = [
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/",
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
        path: "/leads/:id",
        element: <LeadDetail />,
      },
      {
        path: "/messages",
        element: <Messages />,
      },
      {
        path: "/tasks",
        element: <Tasks />,
      },
      {
        path: "/keywords",
        element: <Keywords />,
      },
      {
        path: "/documents",
        element: <Documents />,
      },
      {
        path: "/templates",
        element: <Templates />,
      },
      {
        path: "/teams",
        element: <Teams />,
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