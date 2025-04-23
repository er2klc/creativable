import { lazy } from "react";

// Lazy loaded components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Leads = lazy(() => import("@/pages/Leads"));
const LeadDetail = lazy(() => import("@/pages/LeadDetail"));
const Messages = lazy(() => import("@/pages/Messages"));
const Calendar = lazy(() => import("@/pages/Calendar"));
const Settings = lazy(() => import("@/pages/Settings"));
const Pool = lazy(() => import("@/pages/Pool"));
const Admin = lazy(() => import("@/pages/Admin"));
const Links = lazy(() => import("@/pages/Links"));

// Preload wichtige Routen
const preloadRoutes = () => {
  const routesToPreload = ["/dashboard", "/contacts", "/messages"];
  routesToPreload.forEach(route => {
    const component = mainRoutes.find(r => r.path === route)?.element;
    if (component) {
      // @ts-ignore
      component.preload?.();
    }
  });
};

export const mainRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
    label: "Dashboard",
  },
  {
    path: "/contacts",
    element: <Leads />,
    label: "Contacts",
  },
  {
    path: "/contacts/:leadId",
    element: <LeadDetail />,
    label: "Contact Detail",
  },
  {
    path: "/pool",
    element: <Pool />,
    label: "Pool",
  },
  {
    path: "/pool/:status",
    element: <Pool />,
    label: "Pool Status",
  },
  {
    path: "/messages",
    element: <Messages />,
    label: "Messages",
  },
  {
    path: "/calendar",
    element: <Calendar />,
    label: "Calendar",
  },
  {
    path: "/settings",
    element: <Settings />,
    label: "Settings",
  },
  {
    path: "/admin",
    element: <Admin />,
    label: "Admin",
  },
  {
    path: "/links",
    element: <Links />,
    label: "Links",
  },
];

// Starte Preloading nach Definition der Routen
preloadRoutes();
