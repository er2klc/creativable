import { Check, Calendar, User } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface TaskItemProps {
  task: Tables<"tasks"> & {
    leads?: Tables<"leads">;
  };
  onToggle: () => void;
}

export const TaskItem = ({ task, onToggle }: TaskItemProps) => {
  const { settings } = useSettings();
  const navigate = useNavigate();

  const handleContactClick = () => {
    if (task.lead_id) {
      navigate(`/leads?leadId=${task.lead_id}`);
    }
  };

  return (
    <div
      className={`flex flex-col gap-2 p-4 rounded-lg shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1 cursor-grab active:cursor-grabbing ${
        task.completed ? "opacity-75" : ""
      }`}
      style={{ 
        backgroundColor: task.color || "#FFA500",
        border: "1px solid rgba(0,0,0,0.1)"
      }}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`flex-shrink-0 flex items-center justify-center w-5 h-5 rounded border mt-1 ${
            task.completed
              ? "bg-green-500 border-green-600 text-white"
              : "bg-white border-gray-300"
          }`}
        >
          {task.completed && <Check className="h-4 w-4" />}
        </button>
        <div className={`flex-1 ${task.completed ? "line-through text-gray-500" : ""}`}>
          <div className="font-medium">{task.title}</div>
          
          {task.leads && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              onClick={handleContactClick}
            >
              <User className="h-4 w-4" />
              {task.leads.name}
            </Button>
          )}

          {task.due_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), 
                  settings?.language === "en" 
                    ? "MMM d, yyyy" 
                    : "dd.MM.yyyy"
                )}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};