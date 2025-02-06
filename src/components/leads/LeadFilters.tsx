
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PlusCircle, GitBranch, Pencil, Save, Trash2 } from "lucide-react";
import { CreatePipelineDialog } from "./pipeline/CreatePipelineDialog";
import { DeletePipelineDialog } from "./pipeline/DeletePipelineDialog";
import { usePipelineManagement } from "./pipeline/hooks/usePipelineManagement";
import { useSettings } from "@/hooks/use-settings";

interface LeadFiltersProps {
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
  onEditModeChange?: (isEditMode: boolean) => void;
}

export const LeadFilters = ({
  selectedPipelineId,
  setSelectedPipelineId,
  onEditModeChange,
}: LeadFiltersProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { settings } = useSettings();

  const {
    pipelines,
    isEditMode,
    editingPipelineName,
    setEditingPipelineName,
    showDeleteDialog,
    setShowDeleteDialog,
    handleEditModeToggle,
    handleSaveChanges,
    handleDeletePipeline,
  } = usePipelineManagement(selectedPipelineId, setSelectedPipelineId, onEditModeChange);

  const selectedPipeline = pipelines.find(p => p.id === selectedPipelineId);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className={`min-w-[200px] justify-between ${isEditMode ? 'bg-primary/10 border-primary/20' : ''}`}
          >
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              {selectedPipeline?.name || "Pipeline wählen"}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {pipelines.map(pipeline => (
            <DropdownMenuItem 
              key={pipeline.id}
              onClick={() => setSelectedPipelineId(pipeline.id)}
              className="flex items-center justify-between"
            >
              <span>{pipeline.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Pipeline hinzufügen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant={isEditMode ? "default" : "outline"}
        size="icon"
        onClick={handleEditModeToggle}
        className={`h-9 w-9 transition-colors ${
          isEditMode ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
        }`}
        title={isEditMode ? "Bearbeitungsmodus beenden" : "Pipeline-Name bearbeiten"}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      {selectedPipelineId && isEditMode && pipelines.length > 1 && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          className="h-9 w-9"
          title={settings?.language === "en" ? "Delete Pipeline" : "Pipeline löschen"}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}

      {isEditMode && (
        <div className="flex items-center gap-2">
          <Input
            value={editingPipelineName}
            onChange={(e) => setEditingPipelineName(e.target.value)}
            placeholder={settings?.language === "en" ? "Pipeline Name" : "Pipeline-Name"}
            className="max-w-xs"
          />
          <Button 
            onClick={handleSaveChanges} 
            variant="outline" 
            size="icon"
            className="h-9 w-9"
            title={settings?.language === "en" ? "Save Pipeline Name" : "Pipeline-Name speichern"}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>
      )}

      <CreatePipelineDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />

      <DeletePipelineDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeletePipeline}
      />
    </div>
  );
};
