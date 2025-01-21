import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";

interface KanbanHeaderProps {
  isEditMode: boolean;
  editingPipelineName: string;
  onEditingPipelineNameChange: (name: string) => void;
  onSaveChanges: () => void;
}

export const KanbanHeader = ({
  isEditMode,
  editingPipelineName,
  onEditingPipelineNameChange,
  onSaveChanges,
}: KanbanHeaderProps) => {
  const { settings } = useSettings();

  return (
    <div className="flex items-center justify-between p-4 bg-background sticky top-0 z-20 border-b">
      {isEditMode ? (
        <div className="flex items-center gap-2">
          <Input
            value={editingPipelineName}
            onChange={(e) => onEditingPipelineNameChange(e.target.value)}
            placeholder={settings?.language === "en" ? "Pipeline Name" : "Name der Pipeline"}
            className="w-[200px]"
          />
          <Button onClick={onSaveChanges}>
            {settings?.language === "en" ? "Save Changes" : "Änderungen speichern"}
          </Button>
        </div>
      ) : null}
    </div>
  );
};