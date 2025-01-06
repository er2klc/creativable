import { Checkbox } from "@/components/ui/checkbox";

interface CompletionCheckboxProps {
  completed: boolean;
  onChange: (checked: boolean) => void;
}

export const CompletionCheckbox = ({ completed, onChange }: CompletionCheckboxProps) => {
  return (
    <div className="flex items-center space-x-2 mt-4">
      <Checkbox
        id="completed"
        checked={completed}
        onCheckedChange={(checked) => onChange(checked as boolean)}
      />
      <label
        htmlFor="completed"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Als erledigt markieren
      </label>
    </div>
  );
};