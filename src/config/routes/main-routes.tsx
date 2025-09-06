import { lazy } from "react";

// Lazy loaded components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Messages = lazy(() => import("@/pages/Messages"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Settings = lazy(() => import("@/pages/Settings"));
const Links = lazy(() => import("@/pages/Links"));

export const mainRoutes = [
  {
    path: "/dashboard", 
    element: Dashboard,
    label: "Dashboard",
  },
  {
    path: "/messages",
    element: Messages,
    label: "Messages",
  },
  {
    path: "/calendar",
    element: Calendar,
    label: "Calendar", 
  },
  {
    path: "/settings",
    element: Settings,
    label: "Settings",
  },
  {
    path: "/links",
    element: Links,
    label: "Links",
  },
];
