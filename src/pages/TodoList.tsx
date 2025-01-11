import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddTaskDialog } from "@/components/todo/AddTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare } from "lucide-react";
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

interface Task {
  id: string;
  title: string;
  completed: boolean;
  lead_id: string | null;
  created_at: string;
  priority: string;
  order_index: number;
}

function SortableTask({ task }: { task: Task }) {
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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-4 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => handleTaskComplete(task.id, e.target.checked)}
        className="h-4 w-4"
      />
      <span className={task.completed ? "line-through text-gray-500" : "flex-1"}>
        {task.title}
      </span>
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
    </div>
  );
}

export default function TodoList() {
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*, leads(name)')
        .is('lead_id', null)
        .order('order_index', { ascending: true })
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return tasks as Task[];
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: string; data: any }) => {
      const { error } = await supabase
        .from('tasks')
        .update(data)
        .eq('id', taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);
      
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      
      // Update order_index for all affected tasks
      const updates = newTasks.map((task, index) => 
        updateTaskMutation.mutateAsync({
          taskId: task.id,
          data: { order_index: index }
        })
      );

      await Promise.all(updates);
    }
  };

  // Filter out completed tasks for display
  const incompleteTasks = tasks.filter(task => !task.completed);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="h-6 w-6" />
          ToDos
        </h1>
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
          <div className="space-y-4">
            {incompleteTasks.map((task) => (
              <SortableTask key={task.id} task={task} />
            ))}
          </div>
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