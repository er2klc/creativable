import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Calendar from "@/pages/Calendar";
import TodoList from "@/pages/TodoList";
import Unity from "@/pages/Unity";
import TeamDetail from "@/pages/TeamDetail";
import Elevate from "@/pages/Elevate";
import PlatformDetail from "@/pages/PlatformDetail";
import Leads from "@/pages/Leads";
import Messages from "@/pages/Messages";
import Settings from "@/pages/Settings";
import Changelog from "@/pages/Changelog";
import Tools from "@/pages/Tools";
import SignatureGenerator from "@/pages/SignatureGenerator";
import TreeGenerator from "@/pages/TreeGenerator";

export const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/admin", element: <Admin /> },
  { path: "/calendar", element: <Calendar /> },
  { path: "/todo", element: <TodoList /> },
  { path: "/unity", element: <Unity /> },
  { path: "/unity/team/:teamSlug", element: <TeamDetail /> },
  { path: "/elevate", element: <Elevate /> },
  { path: "/elevate/modul/:moduleSlug", element: <PlatformDetail /> },
  { path: "/leads", element: <Leads /> },
  { path: "/messages", element: <Messages /> },
  { path: "/settings", element: <Settings /> },
  { path: "/changelog", element: <Changelog /> },
  { path: "/tools", element: <Tools /> },
  { path: "/tools/signature", element: <SignatureGenerator /> },
  { path: "/tools/tree", element: <TreeGenerator /> }
];
