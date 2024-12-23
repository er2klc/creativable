import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

interface TaskListProps {
  leadId: string;
  tasks: Tables<"tasks">[];
}

export function TaskList({ leadId, tasks }: TaskListProps) {
  const { settings } = useSettings();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FEF7CD");
  const queryClient = useQueryClient();

  const incompleteTasks = tasks.filter(task => !task.completed);

  const addTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          lead_id: leadId,
          title,
          color: selectedColor,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      setNewTaskTitle("");
      toast.success(settings?.language === "en" ? "Task added" : "Aufgabe hinzugefügt");
    },
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (task: Tables<"tasks">) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", task.id)
        .select()
        .single();

      if (error) throw error;
      return data;
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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTaskMutation.mutate(newTaskTitle);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {settings?.language === "en" ? "Tasks" : "Aufgaben"} ({incompleteTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={settings?.language === "en" ? "New task..." : "Neue Aufgabe..."}
          />
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <Button type="submit" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </form>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 p-2 rounded transition-colors"
              style={{ backgroundColor: task.color || "#FEF7CD" }}
            >
              <button
                onClick={() => toggleTaskMutation.mutate(task)}
                className={`flex items-center justify-center w-5 h-5 rounded border ${
                  task.completed
                    ? "bg-green-500 border-green-600 text-white"
                    : "bg-white border-gray-300"
                }`}
              >
                {task.completed && <Check className="h-4 w-4" />}
              </button>
              <span className={task.completed ? "line-through text-gray-500" : ""}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
