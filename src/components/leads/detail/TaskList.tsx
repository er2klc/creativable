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

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", leadId],
    queryFn: async () => {
      const query = supabase
        .from("tasks")
        .select("*, leads(name)")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: false });

      if (leadId) {
        query.eq("lead_id", leadId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Tables<"tasks"> & {
        leads?: Tables<"leads">;
      })[];
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
          table: 'tasks'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["tasks", leadId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, leadId]);

  const updateTask = useMutation({
    mutationFn: async (task: Tables<"tasks">) => {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", task.id);

      if (error) throw error;
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
      }
      
      toast.success(
        settings?.language === "en"
          ? task.completed ? "Task uncompleted" : "Task completed! 🎉"
          : task.completed ? "Aufgabe nicht erledigt" : "Aufgabe erledigt! 🎉"
      );
    },
  });

  const updateTaskOrder = useMutation({
    mutationFn: async (updates: Tables<"tasks">[]) => {
      const { error } = await supabase
        .from("tasks")
        .upsert(
          updates.map(task => ({
            id: task.id,
            order_index: task.order_index,
            title: task.title,
            user_id: task.user_id,
            lead_id: task.lead_id,
            completed: task.completed,
            color: task.color,
            priority: task.priority,
            meeting_type: task.meeting_type,
          }))
        );

      if (error) throw error;
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
      order_index: index
    }));

    updateTaskOrder.mutate(updates);
  };

  const incompleteTasks = tasks.filter(task => !task.completed);

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