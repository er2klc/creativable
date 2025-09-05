
import { CheckSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/dashboard/SearchBar";
import { HeaderActions } from "@/components/layout/HeaderActions";

interface TodoHeaderProps {
  incompleteTasksCount: number;
  onAddTask: () => void;
  settings: any;
  userEmail?: string;
}

export function TodoHeader({ incompleteTasksCount, onAddTask, settings, userEmail }: TodoHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
      <div className="w-full">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                ToDos ({incompleteTasksCount})
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-[300px]">
                <SearchBar />
              </div>
              <Button onClick={onAddTask}>
                <Plus className="h-4 w-4 mr-2" />
                {settings?.language === "en" ? "New Task" : "Neue Aufgabe"}
              </Button>
            </div>
            <HeaderActions profile={null} userEmail={userEmail} />
          </div>
        </div>
      </div>
    </div>
  );
}
