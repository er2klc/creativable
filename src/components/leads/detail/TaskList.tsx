import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { TaskForm } from "./tasks/TaskForm";
import { TaskItem } from "./tasks/TaskItem";
import { ClipboardList } from "lucide-react";
import confetti from "canvas-confetti";
import { Tables } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface TaskListProps {
  leadId?: string;
}

export function TaskList({ leadId }: TaskListProps) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", leadId],
    queryFn: async () => {
      try {
        const query = supabase
          .from("tasks")
          .select("*, leads(name)")
          .order("order_index", { ascending: true })
          .order("created_at", { ascending: false });

        if (leadId) {
          query.eq("lead_id", leadId);
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching tasks:", error);
          throw error;
        }

        return data as (Tables<"tasks"> & {
          leads?: Tables<"leads">;
        })[];
      } catch (error) {
        console.error("Error in task query:", error);
        throw error;
      }
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: leadId ? `lead_id=eq.${leadId}` : undefined
        },
        (payload) => {
          console.log('Task change received:', payload);
          queryClient.invalidateQueries({ queryKey: ["tasks", leadId] });
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, leadId]);

  const updateTask = useMutation({
    mutationFn: async (task: Tables<"tasks">) => {
      try {
        const { error } = await supabase
          .from("tasks")
          .update({ completed: !task.completed })
          .eq("id", task.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating task:", error);
        throw error;
      }
    },
    onSuccess: (_, task) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", leadId] });
      
      if (!task.completed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#98FB98', '#87CEEB'],
        });

        toast.success(
          settings?.language === "en"
            ? "Task completed! 🎉"
            : "Aufgabe erledigt! 🎉"
        );
      } else {
        toast.success(
          settings?.language === "en"
            ? "Task uncompleted"
            : "Aufgabe nicht erledigt"
        );
      }
    },
  });

  const updateTaskOrder = useMutation({
    mutationFn: async (updates: Tables<"tasks">[]) => {
      try {
        const { error } = await supabase
          .from("tasks")
          .upsert(updates);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating task order:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", leadId] });
    },
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order indices
    const updates = items.map((task, index) => ({
      ...task,
      order_index: index,
    }));

    updateTaskOrder.mutate(updates);
  };

  const incompleteTasks = tasks.filter(task => !task.completed);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {settings?.language === "en" ? "Loading tasks..." : "Lade Aufgaben..."}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          {settings?.language === "en" ? "Tasks" : "Aufgaben"} ({incompleteTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TaskForm leadId={leadId} />
        <AnimatePresence>
          <div className="space-y-2 mt-4">
            {incompleteTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TaskItem
                  task={task}
                  onToggle={() => updateTask.mutate(task)}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}