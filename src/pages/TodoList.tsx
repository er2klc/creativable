import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddTaskDialog } from "@/components/todo/AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TodoList() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  const { data: tasks = [], refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
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

    await refetch();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todo Liste</h1>
        <Button onClick={() => setIsAddTaskOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Neue Aufgabe
        </Button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow"
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
      </div>

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        onTaskAdded={() => refetch()}
      />
    </div>
  );
}