import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";

interface TaskItemProps {
  task: Tables<"tasks">;
  onToggle: (task: Tables<"tasks">) => void;
}

export const TaskItem = ({ task, onToggle }: TaskItemProps) => {
  const { settings } = useSettings();

  const getMeetingTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; de: string }> = {
      phone_call: { en: "Phone Call", de: "Telefongespräch" },
      on_site: { en: "On-site Meeting", de: "Vor-Ort-Termin" },
      zoom: { en: "Zoom Meeting", de: "Zoom Meeting" },
      initial_meeting: { en: "Initial Meeting", de: "Erstgespräch" },
      presentation: { en: "Presentation", de: "Präsentation" },
      follow_up: { en: "Follow-up", de: "Folgetermin" }
    };
    return labels[type]?.[settings?.language === "en" ? "en" : "de"] || type;
  };

  return (
    <div
      className="flex items-center gap-2 p-2 rounded transition-colors"
      style={{ backgroundColor: task.color || "#FEF7CD" }}
    >
      <button
        onClick={() => onToggle(task)}
        className={`flex items-center justify-center w-5 h-5 rounded border ${
          task.completed
            ? "bg-green-500 border-green-600 text-white"
            : "bg-white border-gray-300"
        }`}
      >
        {task.completed && <Check className="h-4 w-4" />}
      </button>
      <div className={`flex-1 ${task.completed ? "line-through text-gray-500" : ""}`}>
        <div>{task.title}</div>
        {task.due_date && (
          <div className="text-sm text-gray-600">
            {new Date(task.due_date).toLocaleString(
              settings?.language === "en" ? "en-US" : "de-DE",
              {
                dateStyle: "medium",
                timeStyle: "short",
              }
            )}
          </div>
        )}
        {task.meeting_type && (
          <div className="text-sm text-gray-600">
            {getMeetingTypeLabel(task.meeting_type)}
          </div>
        )}
      </div>
    </div>
  );
};