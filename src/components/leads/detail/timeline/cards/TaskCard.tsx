
import { useState, useEffect } from "react";
import { CheckSquare, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "./DeleteButton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as confetti from "canvas-confetti";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  
  // Effects to sync with the parent component
  useEffect(() => {
    if (isCompleted !== completed) {
      setCompleted(isCompleted);
    }
  }, [isCompleted]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#8BC34A', '#CDDC39']
    });
  };

  const handleToggleComplete = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const newState = !completed;
      
      // Optimistic UI update
      setCompleted(newState);
      
      // Update in the database
      const { error } = await supabase
        .from('tasks')
        .update({ completed: newState })
        .eq('id', id);
        
      if (error) throw error;
      
      // On success actions
      if (newState) {
        // Only trigger confetti when completing a task
        triggerConfetti();
      }
      
      // Invalidate relevant queries to sync across all views
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['lead'] });
      
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
      // Revert UI state on error
      setCompleted(!completed);
      toast.error(
        settings?.language === "en"
          ? "Failed to update task"
          : "Fehler beim Aktualisieren der Aufgabe"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to render content with appropriate formatting
  const renderTaskContent = () => {
    if (content.includes('**')) {
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
            completed ? "text-green-500" : "",
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
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
