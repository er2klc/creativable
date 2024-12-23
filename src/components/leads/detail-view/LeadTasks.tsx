import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const taskColors = {
  yellow: 'bg-note-yellow',
  green: 'bg-note-green',
  blue: 'bg-note-blue',
  purple: 'bg-note-purple',
  pink: 'bg-note-pink',
  orange: 'bg-note-orange',
  peach: 'bg-note-peach',
  magenta: 'bg-note-magenta',
  ocean: 'bg-note-ocean',
  primary: 'bg-note-primary',
};

interface LeadTasksProps {
  tasks: Tables<"tasks">[];
}

export function LeadTasks({ tasks }: LeadTasksProps) {
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newTask, setNewTask] = useState("");
  const [selectedColor, setSelectedColor] = useState<keyof typeof taskColors>("yellow");

  const incompleteTasks = tasks.filter(task => !task.completed);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .insert([
          {
            title: newTask,
            lead_id: tasks[0]?.lead_id,
            user_id: tasks[0]?.user_id,
          },
        ]);

      if (error) throw error;

      toast({
        title: settings?.language === "en" ? "Success" : "Erfolg",
        description: settings?.language === "en" ? "Task added successfully" : "Aufgabe erfolgreich hinzugefügt",
      });

      queryClient.invalidateQueries({ queryKey: ["lead", tasks[0]?.lead_id] });
      setNewTask("");
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? "Failed to add task" : "Fehler beim Hinzufügen der Aufgabe",
        variant: "destructive",
      });
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("id", taskId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["lead", tasks[0]?.lead_id] });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en" ? "Failed to update task" : "Fehler beim Aktualisieren der Aufgabe",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {settings?.language === "en" ? "Tasks" : "Aufgaben"} ({incompleteTasks.length})
        </CardTitle>
        <div className="flex gap-2">
          <Select value={selectedColor} onValueChange={(value: keyof typeof taskColors) => setSelectedColor(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(taskColors).map(([color, className]) => (
                <SelectItem key={color} value={color}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${className}`} />
                    {color}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder={settings?.language === "en" ? "Add new task..." : "Neue Aufgabe hinzufügen..."}
              onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
            />
            <Button onClick={handleAddTask}>
              {settings?.language === "en" ? "Add" : "Hinzufügen"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-2 p-4 rounded-lg ${taskColors[selectedColor]} ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <Checkbox
                checked={task.completed || false}
                onCheckedChange={(checked) => handleToggleTask(task.id, checked as boolean)}
              />
              <span className={task.completed ? "line-through" : ""}>{task.title}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}