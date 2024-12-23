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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaskListProps {
  leadId: string;
  tasks: Tables<"tasks">[];
}

const MEETING_TYPES = [
  "phone_call",
  "on_site",
  "zoom",
  "initial_meeting",
  "presentation",
  "follow_up"
];

export function TaskList({ leadId, tasks }: TaskListProps) {
  const { settings } = useSettings();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FEF7CD");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const queryClient = useQueryClient();

  const incompleteTasks = tasks.filter(task => !task.completed);

  const addTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const dueDate = selectedDate && selectedTime 
        ? new Date(`${selectedDate}T${selectedTime}`).toISOString()
        : null;

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          lead_id: leadId,
          title,
          color: selectedColor,
          due_date: dueDate,
          meeting_type: selectedType || null,
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
      setSelectedDate("");
      setSelectedTime("");
      setSelectedType("");
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {settings?.language === "en" ? "Tasks" : "Aufgaben"} ({incompleteTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={settings?.language === "en" ? "New task..." : "Neue Aufgabe..."}
          />
          <div className="flex gap-2 items-center">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <Input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-32"
            />
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={settings?.language === "en" ? "Meeting type" : "Terminart"} />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {getMeetingTypeLabel(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer"
            />
            <Button type="submit" className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              {settings?.language === "en" ? "Add Task" : "Aufgabe hinzufügen"}
            </Button>
          </div>
        </form>
        <div className="space-y-2 mt-4">
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}