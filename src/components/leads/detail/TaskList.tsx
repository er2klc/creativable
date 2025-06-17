
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskItem } from "./tasks/TaskItem";
import { TaskForm } from "./tasks/TaskForm";
import * as confetti from "canvas-confetti";
import { toast } from "sonner";

interface TaskListProps {
  leadId: string;
}

export const TaskList = ({ leadId }: TaskListProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: { title: string; description?: string; due_date?: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            ...taskData,
            lead_id: leadId,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", leadId] });
      setIsAddingTask(false);
      toast.success("Aufgabe erfolgreich erstellt");
    },
    onError: () => {
      toast.error("Fehler beim Erstellen der Aufgabe");
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      const { error } = await supabase
        .from("tasks")
        .update({ 
          completed,
          completed_at: completed ? new Date().toISOString() : null 
        })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", leadId] });
      
      if (variables.completed) {
        confetti.default({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
        toast.success("Aufgabe abgeschlossen! 🎉");
      }
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren der Aufgabe");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", leadId] });
      toast.success("Aufgabe gelöscht");
    },
    onError: () => {
      toast.error("Fehler beim Löschen der Aufgabe");
    },
  });

  if (isLoading) {
    return <div>Lade Aufgaben...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Aufgaben</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingTask(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Neue Aufgabe
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingTask && (
          <TaskForm
            onSubmit={(data) => addTaskMutation.mutate(data)}
            onCancel={() => setIsAddingTask(false)}
            isLoading={addTaskMutation.isPending}
          />
        )}
        
        {tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Noch keine Aufgaben vorhanden
          </p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={(completed) =>
                toggleTaskMutation.mutate({ taskId: task.id, completed })
              }
              onDelete={() => deleteTaskMutation.mutate(task.id)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};
