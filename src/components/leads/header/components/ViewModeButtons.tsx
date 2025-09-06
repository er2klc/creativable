
import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";

interface ViewModeButtonsProps {
  viewMode: "kanban" | "list";
  setViewMode: (mode: "kanban" | "list") => void;
}

export const ViewModeButtons = ({ viewMode, setViewMode }: ViewModeButtonsProps) => {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <Button
        variant={viewMode === "kanban" ? "default" : "outline"}
        size="icon"
        onClick={() => setViewMode("kanban")}
        className="h-9 w-9"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="icon"
        onClick={() => setViewMode("list")}
        className="h-9 w-9"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};
