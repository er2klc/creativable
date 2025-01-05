import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useSettings } from "@/hooks/use-settings";
import { SuccessAnimation } from "@/components/ui/success-animation";
import { AddTaskDialog } from "@/components/todo/AddTaskDialog";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type Task = Database["public"]["Tables"]["tasks"]["Row"] & {
  leads?: {
    name: string;
  };
};

const TodoList = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);

  const { data: fetchedTasks = [] } = useQuery({
    queryKey: ["tasks-without-date"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*, leads(name)")
        .eq("user_id", user.id)
        .is("due_date", null)
        .eq("completed", false)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }

      return data as Task[];
    },
  });

  // Update local state when new data is fetched
  useEffect(() => {
    if (fetchedTasks) {
      setTasks(fetchedTasks);
    }
  }, [fetchedTasks]);

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
        },
        () => {
          // Invalidate and refetch when any task changes
          queryClient.invalidateQueries({ queryKey: ["tasks-without-date"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: true })
        .eq("id", taskId);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        queryClient.invalidateQueries({ queryKey: ["tasks-without-date"] });
        queryClient.invalidateQueries({ queryKey: ["lead"] });
      }, 1500);
      
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error(
        settings?.language === "en"
          ? "Error completing task"
          : "Fehler beim Abschließen der Aufgabe"
      );
    }
  };

  const handleContactClick = (leadId: string) => {
    navigate(`/leads?leadId=${leadId}`);
  };

  const handleReorder = async (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="h-6 w-6" />
          <h1 className="text-2xl font-bold">
            {settings?.language === "en" ? "Todo List" : "Todo Liste"}
          </h1>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowAddDialog(true)}
          className="h-8 w-8"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Reorder.Group axis="y" values={tasks} onReorder={handleReorder}>
          <AnimatePresence>
            {tasks.map((task) => (
              <Reorder.Item key={task.id} value={task}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ 
                    opacity: 0, 
                    x: -300,
                    transition: { duration: 0.5 }
                  }}
                  layout
                >
                  <Card className="p-4 cursor-move hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => handleComplete(task.id)}
                        className="mt-1"
                      />
                      <div className={`flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        <div className="font-medium">{task.title}</div>
                        {task.leads && (
                          <button 
                            onClick={() => handleContactClick(task.lead_id)}
                            className="text-sm text-muted-foreground mt-1 hover:text-primary transition-colors"
                          >
                            {settings?.language === "en" ? "Contact" : "Kontakt"}: {task.leads.name}
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            {settings?.language === "en" 
              ? "No tasks without due date" 
              : "Keine Aufgaben ohne Fälligkeitsdatum"}
          </div>
        )}
      </div>

      <SuccessAnimation show={showSuccess} />
      <AddTaskDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  );
};

export default TodoList;