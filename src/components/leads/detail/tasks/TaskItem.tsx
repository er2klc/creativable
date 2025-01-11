import { Check, Calendar } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { Badge } from "@/components/ui/badge";

interface TaskItemProps {
  task: Tables<"tasks">;
  onToggle: () => void;
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
      className="flex flex-col gap-2 p-4 rounded-lg shadow-md transition-all hover:shadow-lg transform hover:-translate-y-1"
      style={{ backgroundColor: task.color || "#FEF7CD" }}
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
          {task.due_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(task.due_date).toLocaleString(
                  settings?.language === "en" ? "en-US" : "de-DE",
                  {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }
                )}
              </Badge>
            </div>
          )}
          {task.meeting_type && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-sm">
                {getMeetingTypeLabel(task.meeting_type)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};