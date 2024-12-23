import { Check, Calendar, Clock } from "lucide-react";
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
    const labels: Record<string, { en: string; de: string; emoji: string }> = {
      phone_call: { en: "Phone Call", de: "Telefongespräch", emoji: "📞" },
      on_site: { en: "On-site Meeting", de: "Vor-Ort-Termin", emoji: "🏢" },
      zoom: { en: "Zoom Meeting", de: "Zoom Meeting", emoji: "💻" },
      initial_meeting: { en: "Initial Meeting", de: "Erstgespräch", emoji: "👋" },
      presentation: { en: "Presentation", de: "Präsentation", emoji: "📊" },
      follow_up: { en: "Follow-up", de: "Folgetermin", emoji: "🔄" }
    };
    const label = labels[type];
    if (!label) return type;
    return `${label[settings?.language === "en" ? "en" : "de"]} ${label.emoji}`;
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
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
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