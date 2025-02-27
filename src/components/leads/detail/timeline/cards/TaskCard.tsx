
import { useState } from "react";
import { CheckSquare, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "./DeleteButton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskCardProps {
  id: string;
  content: string;
  metadata?: {
    dueDate?: string;
    color?: string;
    [key: string]: any;
  };
  isCompleted?: boolean;
  onDelete?: () => void;
  onToggleComplete?: (id: string, completed: boolean) => void;
}

export function TaskCard({
  id,
  content,
  metadata,
  isCompleted = false,
  onDelete,
  onToggleComplete,
}: TaskCardProps) {
  const { settings } = useSettings();
  const [completed, setCompleted] = useState(isCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleComplete = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const newState = !completed;
      setCompleted(newState);
      
      // Update in the database
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newState })
        .eq('id', id);
        
      if (error) throw error;
      
      // Call the callback if provided
      if (onToggleComplete) {
        onToggleComplete(id, newState);
      }
      
      toast.success(
        settings?.language === "en"
          ? newState ? "Task completed" : "Task reopened" 
          : newState ? "Aufgabe abgeschlossen" : "Aufgabe wiedereröffnet"
      );
    } catch (error) {
      console.error("Error updating task:", error);
      setCompleted(!completed); // Revert UI state on error
      toast.error(
        settings?.language === "en"
          ? "Failed to update task"
          : "Fehler beim Aktualisieren der Aufgabe"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to determine if a string contains markdown bold syntax
  const containsBoldMarkdown = (text: string) => {
    return /\*\*(.*?)\*\*/g.test(text);
  };

  // Function to render content with appropriate formatting
  const renderTaskContent = () => {
    if (containsBoldMarkdown(content)) {
      // Replace markdown bold with HTML bold
      return <div dangerouslySetInnerHTML={{ 
        __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
      }} />;
    }
    return <span>{content}</span>;
  };

  return (
    <div className="relative group">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "p-0 h-5 w-5",
            completed && "text-green-500"
          )}
          onClick={handleToggleComplete}
          disabled={isSubmitting}
        >
          {completed ? (
            <CheckSquare className="h-5 w-5" />
          ) : (
            <SquareCheck className="h-5 w-5" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className={cn(
            "text-sm", 
            completed && "line-through text-gray-500"
          )}>
            {renderTaskContent()}
          </div>
          
          {metadata?.dueDate && (
            <div className={cn(
              "text-xs mt-1",
              new Date(metadata.dueDate) < new Date() && !completed
                ? "text-red-500 font-medium"
                : "text-gray-500"
            )}>
              {settings?.language === "en" ? "Due" : "Fällig"}: {format(new Date(metadata.dueDate), "PPP")}
            </div>
          )}
        </div>
        
        {onDelete && <DeleteButton onDelete={onDelete} />}
      </div>
    </div>
  );
}
