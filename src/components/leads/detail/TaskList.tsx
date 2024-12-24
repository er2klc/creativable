import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TaskForm } from "./tasks/TaskForm";
import { TaskItem } from "./tasks/TaskItem";
import { ClipboardList } from "lucide-react";

interface TaskListProps {
  leadId: string;
  tasks: Tables<"tasks">[];
}

export function TaskList({ leadId, tasks }: TaskListProps) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const addTaskMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      color: string;
      due_date: string | null;
      meeting_type: string | null;
    }) => {
      const { error } = await supabase
        .from("tasks")
        .insert({
          lead_id: leadId,
          title: data.title,
          color: data.color,
          due_date: data.due_date,
          meeting_type: data.meeting_type,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en" ? "Task added" : "Aufgabe hinzugefügt"
      );
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (task: Tables<"tasks">) => {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", task.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Task status updated"
          : "Aufgabenstatus aktualisiert"
      );
    },
  });

  const incompleteTasks = tasks.filter(task => !task.completed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {settings?.language === "en" ? "Tasks" : "Aufgaben"} ({incompleteTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TaskForm onSubmit={(data) => addTaskMutation.mutate(data)} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(task) => toggleTaskMutation.mutate(task)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}