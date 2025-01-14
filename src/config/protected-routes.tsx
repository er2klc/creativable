import { lazy } from "react";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Settings = lazy(() => import("@/pages/Settings"));
const VisionBoard = lazy(() => import("@/pages/VisionBoard"));

export const protectedRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/vision-board",
    element: <VisionBoard />,
  },
];