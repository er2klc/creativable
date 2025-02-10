import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddTaskDialog } from "@/components/todo/AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare, User } from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Tables } from "@/integrations/supabase/types";

interface Task extends Tables<"tasks"> {
  leads?: Tables<"leads">;
}

function SortableTask({ task, updateTaskMutation, settings }: { task: Task, updateTaskMutation: any, settings: any }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    if (completed) {
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
    }

    await updateTaskMutation.mutateAsync({
      taskId,
      data: { completed }
    });
  };

  const handlePriorityChange = async (taskId: string, priority: string) => {
    await updateTaskMutation.mutateAsync({
      taskId,
      data: { priority }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <input
        type="checkbox"
        checked={task.completed || false}
        onChange={(e) => handleTaskComplete(task.id, e.target.checked)}
        className="h-4 w-4 cursor-pointer"
      />
      <div className="flex-1">
        <span className={task.completed ? "line-through text-gray-500" : ""}>
          {task.title}
        </span>
        {task.leads && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            {task.leads.name}
          </div>
        )}
      </div>
      <Select
        value={task.priority}
        onValueChange={(value) => handlePriorityChange(task.id, value)}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>
    </motion.div>
  );
}

export default function TodoList() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        (payload) => {
          console.log('Task change received:', payload);
          queryClient.invalidateQueries({ queryKey: ['tasks'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      
      try {
        const updates = newTasks.map((task, index) => ({
          id: task.id,
          order_index: index,
          user_id: task.user_id,
          title: task.title,
          priority: task.priority || 'Medium',
          completed: task.completed || false,
          lead_id: task.lead_id
        }));

        const { error } = await supabase
          .from('tasks')
          .upsert(updates);

        if (error) {
          console.error('Error updating task order:', error);
          throw error;
        }

        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      } catch (error) {
        console.error('Error in handleDragEnd:', error);
        toast.error(
          settings?.language === "en"
            ? "Failed to reorder tasks"
            : "Fehler beim Neuordnen der Aufgaben"
        );
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Filter out completed tasks for display
  const incompleteTasks = tasks.filter(task => !task.completed);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">ToDos ({incompleteTasks.length})</h1>
        </div>
        <Button onClick={() => setIsAddTaskOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {settings?.language === "en" ? "New Task" : "Neue Aufgabe"}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={incompleteTasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            <div className="space-y-4">
              {incompleteTasks.map((task) => (
                <SortableTask 
                  key={task.id} 
                  task={task} 
                  updateTaskMutation={updateTaskMutation}
                  settings={settings}
                />
              ))}
            </div>
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {incompleteTasks.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          {settings?.language === "en" 
            ? "No tasks to display" 
            : "Keine Aufgaben vorhanden"}
        </div>
      )}

      <AddTaskDialog
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
      />
    </div>
  );
}
