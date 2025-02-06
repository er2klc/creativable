import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Plan from "@/pages/Plan";
import Billing from "@/pages/Billing";
import Contacts from "@/pages/Contacts";
import Pool from "@/pages/Pool";
import Calendar from "@/pages/Calendar";
import Todo from "@/pages/Todo";
import Messages from "@/pages/Messages";
import Links from "@/pages/Links";
import Unity from "@/pages/Unity";
import Elevate from "@/pages/Elevate";
import Admin from "@/pages/Admin";

export const mainRoutes = [
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "settings", element: <Settings /> },
      { path: "plan", element: <Plan /> },
      { path: "billing", element: <Billing /> },
      { path: "contacts", element: <Contacts /> },
      { path: "pool", element: <Pool /> },
      { path: "calendar", element: <Calendar /> },
      { path: "todo", element: <Todo /> },
      { path: "messages", element: <Messages /> },
      { path: "links", element: <Links /> },
      { path: "unity", element: <Unity /> },
      { path: "elevate", element: <Elevate /> },
      { path: "admin", element: <Admin /> }
    ]
  }
];