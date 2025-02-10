
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

interface Task extends Tables<"tasks"> {
  leads?: Tables<"leads">;
}

export function useTodoTasks(settings: any) {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const { data, error } = await supabase
          .from('tasks')
          .select('*, leads(name)')
          .eq('user_id', user.id)
          .order('order_index', { ascending: true })
          .order('priority', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching tasks:', error);
          throw error;
        }

        return data as Task[];
      } catch (error) {
        console.error('Error in task query:', error);
        throw error;
      }
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: Partial<Task> }) => {
      try {
        const { error } = await supabase
          .from('tasks')
          .update(data)
          .eq('id', taskId);

        if (error) {
          console.error('Error updating task:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error in updateTaskMutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast.error(
        settings?.language === "en"
          ? "Failed to update task"
          : "Fehler beim Aktualisieren der Aufgabe"
      );
    }
  });

  return {
    tasks,
    isLoading,
    updateTaskMutation
  };
}
