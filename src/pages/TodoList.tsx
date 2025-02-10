
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddTaskDialog } from "@/components/todo/AddTaskDialog";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
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
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { SortableTask } from "@/components/todo/SortableTask";
import { TodoHeader } from "@/components/todo/TodoHeader";
import { useTodoTasks } from "@/hooks/todo/useTodoTasks";

export default function TodoList() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { settings } = useSettings();
  const { user } = useAuth();
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

  const { tasks, isLoading, updateTaskMutation } = useTodoTasks(settings);

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
    <div className="min-h-screen bg-gray-50/50">
      <TodoHeader
        incompleteTasksCount={incompleteTasks.length}
        onAddTask={() => setIsAddTaskOpen(true)}
        settings={settings}
        userEmail={user?.email}
      />

      <div className="container mx-auto pt-24 md:pt-[84px] px-4">
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
    </div>
  );
}
