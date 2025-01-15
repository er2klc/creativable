import { Navigate, Outlet } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Leads from "@/pages/Leads";
import Messages from "@/pages/Messages";
import TeamDetail from "@/pages/TeamDetail";
import TeamDiscussions from "@/pages/TeamDiscussions";
import Unity from "@/pages/Unity";
import TodoList from "@/pages/TodoList";
import Calendar from "@/pages/Calendar";
import Elevate from "@/pages/Elevate";
import PlatformDetail from "@/pages/PlatformDetail";

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
        path: "/team/:teamSlug/discussions",
        element: <TeamDiscussions />,
      },
      {
        path: "/unity",
        element: <Unity />,
      },
      {
        path: "/todo",
        element: <TodoList />,
      },
      {
        path: "/calendar",
        element: <Calendar />,
      },
      {
        path: "/elevate",
        element: <Elevate />,
      },
      {
        path: "/elevate/modul/:platformSlug",
        element: <PlatformDetail />,
      }
    ],
  },
] as const;