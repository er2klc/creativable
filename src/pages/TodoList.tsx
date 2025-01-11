import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddTaskDialog } from "@/components/todo/AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

export default function TodoList() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { settings } = useSettings();

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .is('lead_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return tasks;
    }
  });

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task:', error);
      return;
    }

    if (completed) {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#98FB98', '#87CEEB'],
      });

      // Show success toast
      toast.success(
        settings?.language === "en" 
          ? "Task completed! 🎉" 
          : "Aufgabe erledigt! 🎉"
      );
    }

    await refetch();
  };

  // Filter out completed tasks for display
  const incompleteTasks = tasks.filter(task => !task.completed);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {settings?.language === "en" ? "Todo List" : "Aufgabenliste"}
        </h1>
        <Button onClick={() => setIsAddTaskOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {settings?.language === "en" ? "New Task" : "Neue Aufgabe"}
        </Button>
      </div>

      <div className="space-y-4">
        {incompleteTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={(e) => handleTaskComplete(task.id, e.target.checked)}
              className="h-4 w-4"
            />
            <span className={task.completed ? "line-through text-gray-500" : ""}>
              {task.title}
            </span>
          </div>
        ))}
        
        {incompleteTasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            {settings?.language === "en" 
              ? "No tasks to display" 
              : "Keine Aufgaben vorhanden"}
          </div>
        )}
      </div>

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
      />
    </div>
  );
}