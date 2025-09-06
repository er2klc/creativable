
import { User } from "lucide-react";
import { motion } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tables } from "@/integrations/supabase/types";
import * as confetti from "canvas-confetti";
import { toast } from "sonner";

interface Task extends Tables<"tasks"> {
  leads?: Tables<"leads">;
}

interface SortableTaskProps {
  task: Task;
  updateTaskMutation: any;
  settings: any;
}

export function SortableTask({ task, updateTaskMutation, settings }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
    transition,
  } : {};

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

  // Function to render content with appropriate formatting
  const renderTaskContent = () => {
    if (task.title?.includes('**')) {
      return <div dangerouslySetInnerHTML={{ 
        __html: task.title.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
      }} />;
    }
    return <span>{task.title}</span>;
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
          {renderTaskContent()}
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
