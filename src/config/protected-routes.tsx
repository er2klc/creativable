import VisionBoard from "@/pages/VisionBoard";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Calendar from "@/pages/Calendar";
import Leads from "@/pages/Leads";
import Messages from "@/pages/Messages";
import Tools from "@/pages/Tools";
import SignatureGenerator from "@/pages/SignatureGenerator";
import BioGenerator from "@/pages/BioGenerator";
import TreeGenerator from "@/pages/TreeGenerator";
import TodoList from "@/pages/TodoList";
import Unity from "@/pages/Unity";
import Elevate from "@/pages/Elevate";

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
    path: "/calendar",
    element: <Calendar />,
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
    path: "/tools",
    element: <Tools />,
  },
  {
    path: "/signature-generator",
    element: <SignatureGenerator />,
  },
  {
    path: "/bio-generator",
    element: <BioGenerator />,
  },
  {
    path: "/tree-generator",
    element: <TreeGenerator />,
  },
  {
    path: "/todo",
    element: <TodoList />,
  },
  {
    path: "/vision-board",
    element: <VisionBoard />,
  },
  {
    path: "/unity",
    element: <Unity />,
  },
  {
    path: "/elevate",
    element: <Elevate />,
  },
];