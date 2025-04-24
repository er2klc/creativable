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

// Temporäre Test-Komponente für Debugging
const TestContacts = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Kontakte Testseite</h1>
      <p>Wenn Sie diese Seite sehen, funktioniert die Route, aber die eigentliche Leads-Komponente hat Probleme.</p>
    </div>
  );
};

export const mainRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
    label: "Dashboard",
  },
  {
    path: "/contacts",
    // Temporär die Test-Komponente anstelle von Leads verwenden
    element: <TestContacts />,
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

// Vorsichtigeres Preloading ohne potenzielle zirkuläre Referenzen
setTimeout(() => {
  // Dashboard vorausladen - häufig besuchte Seite
  import("@/pages/Dashboard").catch(console.error);
}, 1000);
