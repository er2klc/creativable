import React, { useState, useEffect } from "react";
import { Check, Circle, Plus, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import confetti from 'canvas-confetti';

interface Task {
  id: string;
  task: string;
  completed: boolean;
}

interface TaskListProps {
  leadId: string;
}

export const TaskList = ({ leadId }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createTaskMutation } = useMutation({
    mutationFn: async (task: string) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{ lead_id: leadId, task, completed: false }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (newTask) => {
      setTasks([...tasks, newTask]);
      setNewTask("");
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast({
        title:
          settings?.language === "en" ? "Task created" : "Aufgabe erstellt",
      });
    },
    onError: (error: any) => {
      console.error("Error creating task:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description:
          settings?.language === "en"
            ? "Failed to create task"
            : "Aufgabe konnte nicht erstellt werden",
        variant: "destructive",
      });
    },
  });

  const { mutate: updateTaskMutation } = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (updatedTask) => {
      setTasks(
        tasks.map((task) =>
          task.id === updatedTask.id ? { ...task, completed: updatedTask.completed } : task
        )
      );
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast({
        title:
          settings?.language === "en" ? "Task updated" : "Aufgabe aktualisiert",
      });
      
      // Check if all tasks are completed
      if (tasks.every(task => task.completed)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    },
    onError: (error: any) => {
      console.error("Error updating task:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description:
          settings?.language === "en"
            ? "Failed to update task"
            : "Aufgabe konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteTaskMutation } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) {
        throw error;
      }
    },
    onSuccess: (_, taskId) => {
      setTasks(tasks.filter((task) => task.id !== taskId));
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast({
        title:
          settings?.language === "en" ? "Task deleted" : "Aufgabe gelöscht",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting task:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description:
          settings?.language === "en"
            ? "Failed to delete task"
            : "Aufgabe konnte nicht gelöscht werden",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("lead_id", leadId);

      if (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: settings?.language === "en" ? "Error" : "Fehler",
          description:
            settings?.language === "en"
              ? "Failed to load tasks"
              : "Aufgaben konnten nicht geladen werden",
          variant: "destructive",
        });
        return;
      }

      setTasks(data || []);
    };

    fetchTasks();
  }, [leadId, settings?.language, toast]);

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      createTaskMutation(newTask.trim());
    }
  };

  const handleTaskCompletion = (id: string, completed: boolean) => {
    updateTaskMutation({ id, completed });
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          type="text"
          placeholder={
            settings?.language === "en" ? "Add new task" : "Neue Aufgabe hinzufügen"
          }
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleAddTask();
            }
          }}
        />
        <Button onClick={handleAddTask}>
          <Plus className="h-4 w-4 mr-2" />
          {settings?.language === "en" ? "Add" : "Hinzufügen"}
        </Button>
      </div>
      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center justify-between p-2 rounded-md shadow-sm border"
          >
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleTaskCompletion(task.id, !task.completed)}
              >
                {task.completed ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4" />
                )}
              </Button>
              <span className={task.completed ? "line-through text-gray-500" : ""}>
                {task.task}
              </span>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteTask(task.id)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};
