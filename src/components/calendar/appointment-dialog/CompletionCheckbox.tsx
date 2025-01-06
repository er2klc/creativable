import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompletionCheckboxProps {
  completed: boolean;
  cancelled: boolean;
  onChange: (completed: boolean, cancelled: boolean) => void;
}

export const CompletionCheckbox = ({ completed, cancelled, onChange }: CompletionCheckboxProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2",
          completed && "text-green-500 hover:text-green-600"
        )}
        onClick={() => onChange(!completed, false)}
      >
        <Check className="h-4 w-4" />
        Abgeschlossen
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "gap-2",
          cancelled && "text-red-500 hover:text-red-600"
        )}
        onClick={() => onChange(false, !cancelled)}
      >
        <X className="h-4 w-4" />
        Abgelehnt
      </Button>
    </div>
  );
};