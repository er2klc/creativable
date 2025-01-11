import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { TaskForm } from "./tasks/TaskForm";
import { TaskItem } from "./tasks/TaskItem";
import { ClipboardList } from "lucide-react";
import confetti from "canvas-confetti";
import { Tables } from "@/integrations/supabase/types";

interface TaskListProps {
  leadId: string;
}

export function TaskList({ leadId }: TaskListProps) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["lead", leadId, "tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tables<"tasks">[];
    },
  });

  const updateTask = useMutation({
    mutationFn: async (task: Tables<"tasks">) => {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", task.id);

      if (error) throw error;
    },
    onSuccess: (_, task) => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      
      if (!task.completed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#98FB98', '#87CEEB'],
        });
      }
      
      toast.success(
        settings?.language === "en"
          ? task.completed ? "Task uncompleted" : "Task completed! 🎉"
          : task.completed ? "Aufgabe nicht erledigt" : "Aufgabe erledigt! 🎉"
      );
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {settings?.language === "en" ? "Tasks" : "Aufgaben"} ({tasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TaskForm leadId={leadId} />
        <div className="space-y-2 mt-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => updateTask.mutate(task)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}