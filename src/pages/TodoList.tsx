import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/hooks/use-settings";
import { SuccessAnimation } from "@/components/ui/success-animation";
import { AddTaskDialog } from "@/components/todo/AddTaskDialog";

const TodoList = () => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks-without-date"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("tasks")
        .select("*, leads(name)")
        .eq("user_id", user.id)
        .is("due_date", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        return [];
      }

      return data;
    },
  });

  const handleComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: true })
        .eq("id", taskId);

      if (error) throw error;

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);

      // Update the tasks list
      await queryClient.invalidateQueries({ queryKey: ["tasks-without-date"] });
      
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error(
        settings?.language === "en"
          ? "Error completing task"
          : "Fehler beim Abschließen der Aufgabe"
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {settings?.language === "en" ? "Todo List" : "Aufgabenliste"}
        </h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {settings?.language === "en" ? "Add Task" : "Aufgabe hinzufügen"}
        </Button>
      </div>
      
      <div className="grid gap-4">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ 
                opacity: 0, 
                x: -300,
                transition: { duration: 0.5 }
              }}
              layout
            >
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleComplete(task.id)}
                    className="mt-1"
                  />
                  <div className={`flex-1 ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                    <div className="font-medium">{task.title}</div>
                    {task.leads && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {settings?.language === "en" ? "Contact" : "Kontakt"}: {task.leads.name}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

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