import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface TaskFormProps {
  leadId: string;
}

export const TaskForm = ({ leadId }: TaskFormProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FFA500"); // Orange for tasks
  const [deadline, setDeadline] = useState("");

  const addTaskMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      color: string;
      due_date: string | null;
    }) => {
      const { error } = await supabase
        .from("tasks")
        .insert({
          lead_id: leadId,
          title: data.title,
          color: data.color,
          due_date: data.due_date,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] }); // Invalidate ToDo list
      toast.success(
        settings?.language === "en" ? "Task added" : "Aufgabe hinzugefügt"
      );
      setTitle("");
      setDeadline("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTaskMutation.mutate({
        title,
        color: selectedColor,
        due_date: deadline ? `${deadline}T23:59:59` : null,
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={settings?.language === "en" ? "New task..." : "Neue Aufgabe..."}
          />
          <div className="flex gap-2 items-center">
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-40"
              placeholder={settings?.language === "en" ? "Deadline" : "Fälligkeitsdatum"}
            />
            <Button type="submit" className="ml-auto">
              {settings?.language === "en" ? "Add Task" : "Aufgabe hinzufügen"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};