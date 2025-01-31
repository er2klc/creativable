import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, GitBranch, Pencil, Save, Trash2 } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreatePipelineDialog } from "./pipeline/CreatePipelineDialog";
import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const session = useSession();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [hoveredPipeline, setHoveredPipeline] = useState<string | null>(null);
  const { settings, updateSettings } = useSettings();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPipelineName, setEditingPipelineName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (settings?.last_selected_pipeline_id && !selectedPipelineId) {
      setSelectedPipelineId(settings.last_selected_pipeline_id);
    } else if (pipelines.length > 0 && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [settings?.last_selected_pipeline_id, pipelines, selectedPipelineId, setSelectedPipelineId]);

  const handlePipelineSelect = async (pipelineId: string) => {
    setSelectedPipelineId(pipelineId);
    try {
      await updateSettings.mutateAsync({
        last_selected_pipeline_id: pipelineId
      });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    } catch (error) {
      console.error("Error saving selected pipeline:", error);
    }
  };

  const handleEditModeToggle = () => {
    const newEditMode = !isEditMode;
    setIsEditMode(newEditMode);
    onEditModeChange?.(newEditMode);
    const currentPipeline = pipelines.find(p => p.id === selectedPipelineId);
    setEditingPipelineName(currentPipeline?.name || "");
  };

  const handleSaveChanges = async () => {
    if (!selectedPipelineId || !editingPipelineName.trim()) return;

    try {
      const { error } = await supabase
        .from("pipelines")
        .update({ name: editingPipelineName })
        .eq("id", selectedPipelineId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      toast.success(
        settings?.language === "en" 
          ? "Pipeline name updated successfully" 
          : "Pipeline-Name erfolgreich aktualisiert"
      );
      setIsEditMode(false);
      onEditModeChange?.(false);
    } catch (error) {
      console.error("Error updating pipeline name:", error);
      toast.error(
        settings?.language === "en"
          ? "Failed to update pipeline name"
          : "Fehler beim Aktualisieren des Pipeline-Namens"
      );
    }
  };

  const handleDeletePipeline = async () => {
    if (!selectedPipelineId) return;

    try {
      // First delete all phases
      const { error: phasesError } = await supabase
        .from("pipeline_phases")
        .delete()
        .eq("pipeline_id", selectedPipelineId);

      if (phasesError) throw phasesError;

      // Then delete the pipeline
      const { error: pipelineError } = await supabase
        .from("pipelines")
        .delete()
        .eq("id", selectedPipelineId);

      if (pipelineError) throw pipelineError;

      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      localStorage.removeItem('lastUsedPipelineId');
      
      // Select first available pipeline or null if none left
      const remainingPipelines = pipelines.filter(p => p.id !== selectedPipelineId);
      setSelectedPipelineId(remainingPipelines[0]?.id || null);
      
      toast.success(
        settings?.language === "en"
          ? "Pipeline deleted successfully"
          : "Pipeline erfolgreich gelöscht"
      );
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting pipeline:", error);
      toast.error(
        settings?.language === "en"
          ? "Failed to delete pipeline"
          : "Fehler beim Löschen der Pipeline"
      );
    }
  };

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
              onMouseEnter={() => setHoveredPipeline(pipeline.id)}
              onMouseLeave={() => setHoveredPipeline(null)}
              onClick={() => handlePipelineSelect(pipeline.id)}
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

      {selectedPipelineId && (
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {settings?.language === "en" ? "Delete Pipeline" : "Pipeline löschen"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {settings?.language === "en" 
                ? "Are you sure you want to delete this pipeline? This action cannot be undone."
                : "Sind Sie sicher, dass Sie diese Pipeline löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {settings?.language === "en" ? "Cancel" : "Abbrechen"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePipeline}>
              {settings?.language === "en" ? "Delete" : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
