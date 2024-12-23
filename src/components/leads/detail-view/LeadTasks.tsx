import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";

interface LeadTasksProps {
  tasks: Tables<"tasks">[];
}

export function LeadTasks({ tasks }: LeadTasksProps) {
  const { settings } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {settings?.language === "en" ? "Tasks" : "Aufgaben"} ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.completed || false}
                readOnly
                className="h-4 w-4"
              />
              <span>{task.title}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}