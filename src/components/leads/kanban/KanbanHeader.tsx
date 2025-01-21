import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

interface KanbanHeaderProps {
  isEditMode: boolean;
  editingPipelineName: string;
  onEditingPipelineNameChange: (value: string) => void;
  onSaveChanges: () => void;
}

export const KanbanHeader: FC<KanbanHeaderProps> = ({
  isEditMode,
  editingPipelineName,
  onEditingPipelineNameChange,
  onSaveChanges,
}) => {
  const { settings } = useSettings();

  return isEditMode ? (
    <div className="flex items-center gap-2">
      <Input
        value={editingPipelineName}
        onChange={(e) => onEditingPipelineNameChange(e.target.value)}
        placeholder={settings?.language === "en" ? "Pipeline Name" : "Pipeline-Name"}
        className="w-[200px]"
      />
      <Button onClick={onSaveChanges} variant="outline" size="sm">
        <Save className="h-4 w-4 mr-2" />
        {settings?.language === "en" ? "Save Pipeline Name" : "Pipeline-Name speichern"}
      </Button>
    </div>
  ) : null;
};