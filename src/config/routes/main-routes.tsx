
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import Mail from "@/pages/Mail";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import Pool from "@/pages/Pool";
import Admin from "@/pages/Admin";
import Links from "@/pages/Links";

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
    path: "/mail",
    element: <Mail />,
    label: "Mail",
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
