import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import Messages from "@/pages/Messages";
import Calendar from "@/pages/Calendar";
import Settings from "@/pages/Settings";
import Tools from "@/pages/Tools";
import VisionBoard from "@/pages/VisionBoard";
import BioGenerator from "@/pages/BioGenerator";
import TreeGenerator from "@/pages/TreeGenerator";
import TodoList from "@/pages/TodoList";
import Unity from "@/pages/Unity";
import Elevate from "@/pages/Elevate";
import TeamDetail from "@/pages/TeamDetail";
import PlatformDetail from "@/pages/PlatformDetail";
import SignatureGenerator from "@/pages/SignatureGenerator";
import LeaderBoard from "@/pages/LeaderBoard";
import Admin from "@/pages/Admin";
import Pool from "@/pages/Pool";

export const protectedRoutes = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/contacts",
    element: <Leads />,
  },
  {
    path: "/contacts/:leadId",
    element: <LeadDetail />,
  },
  {
    path: "/pool",
    element: <Pool />,
  },
  {
    path: "/pool/:status",
    element: <Pool />,
  },
  {
    path: "/pool/:status/:leadId",
    element: <LeadDetail />,
  },
];
