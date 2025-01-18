import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

interface TaskTabProps {
  leadId: string;
}

export const TaskTab = ({ leadId }: TaskTabProps) => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [newTask, setNewTask] = useState("");

  const handleAddTask = async () => {
    const { error } = await supabase
      .from("tasks")
      .insert({
        lead_id: leadId,
        title: newTask,
        color: '#FFE2DD',
        user_id: user?.id,
      });

    if (error) {
      console.error("Error adding task:", error);
      return;
    }

    setNewTask("");
    toast.success(settings?.language === "en" ? "Task added" : "Aufgabe hinzugefügt");
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>
          {settings?.language === "en" ? "Add Task" : "Aufgabe hinzufügen"}
        </Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder={settings?.language === "en" ? "Enter task..." : "Aufgabe eingeben..."}
          />
          <Button onClick={handleAddTask}>
            {settings?.language === "en" ? "Add" : "Hinzufügen"}
          </Button>
        </div>
      </div>
    </div>
  );
};