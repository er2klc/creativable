import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CompletionCheckboxProps {
  completed: boolean;
  cancelled: boolean;
  onChange: (completed: boolean, cancelled: boolean) => void;
}

export const CompletionCheckbox = ({ completed, cancelled, onChange }: CompletionCheckboxProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          completed && "text-green-500 hover:text-green-600"
        )}
        onClick={() => onChange(!completed, false)}
        title="Als erledigt markieren"
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          cancelled && "text-red-500 hover:text-red-600"
        )}
        onClick={() => onChange(false, !cancelled)}
        title="Als abgelehnt markieren"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};