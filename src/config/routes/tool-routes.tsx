
import Tools from "@/pages/Tools";
import SignatureGenerator from "@/pages/SignatureGenerator";
import BioGenerator from "@/pages/BioGenerator";
import TreeGenerator from "@/pages/TreeGenerator";
import TodoList from "@/pages/TodoList";
import VisionBoard from "@/pages/VisionBoard";

export const toolRoutes = [
  {
    path: "/tools",
    element: <Tools />,
    label: "Tools",
  },
  {
    path: "/signature-generator",
    element: <SignatureGenerator />,
    label: "Signature Generator",
  },
  {
    path: "/bio-generator",
    element: <BioGenerator />,
    label: "Bio Generator",
  },
  {
    path: "/tree-generator",
    element: <TreeGenerator />,
    label: "Tree Generator",
  },
  {
    path: "/todo",
    element: <TodoList />,
    label: "Todo List",
  },
  {
    path: "/vision-board",
    element: <VisionBoard />,
    label: "Vision Board",
  },
];
