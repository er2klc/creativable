import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CompletionCheckboxProps {
  completed: boolean;
  cancelled: boolean;
  onChange: (completed: boolean, cancelled: boolean) => void;
}

export const CompletionCheckbox = ({ completed, cancelled, onChange }: CompletionCheckboxProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Checkbox
          id="completed"
          checked={completed}
          onCheckedChange={(checked) => {
            onChange(checked as boolean, false);
          }}
        />
        <Label htmlFor="completed">Abgeschlossen</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id="cancelled"
          checked={cancelled}
          onCheckedChange={(checked) => {
            onChange(false, checked as boolean);
          }}
        />
        <Label htmlFor="cancelled">Abgelehnt</Label>
      </div>
    </div>
  );
};