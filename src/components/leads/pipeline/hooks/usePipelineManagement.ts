
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export const usePipelineManagement = (
  selectedPipelineId: string | null,
  setSelectedPipelineId: (id: string | null) => void,
  onEditModeChange?: (isEditMode: boolean) => void
) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPipelineName, setEditingPipelineName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

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
    if (!selectedPipelineId || pipelines.length <= 1) return;

    try {
      const fallbackPipeline = pipelines.find(p => p.id !== selectedPipelineId);
      if (!fallbackPipeline) return;

      const { data: fallbackPhase } = await supabase
        .from("pipeline_phases")
        .select("id")
        .eq("pipeline_id", fallbackPipeline.id)
        .order("order_index")
        .limit(1)
        .single();

      if (fallbackPhase) {
        await supabase
          .from("leads")
          .update({
            pipeline_id: fallbackPipeline.id,
            phase_id: fallbackPhase.id
          })
          .eq("pipeline_id", selectedPipelineId);
      }

      const { error: phasesError } = await supabase
        .from("pipeline_phases")
        .delete()
        .eq("pipeline_id", selectedPipelineId);

      if (phasesError) throw phasesError;

      const { error: pipelineError } = await supabase
        .from("pipelines")
        .delete()
        .eq("id", selectedPipelineId);

      if (pipelineError) throw pipelineError;

      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      localStorage.removeItem('lastUsedPipelineId');
      
      const remainingPipelines = pipelines.filter(p => p.id !== selectedPipelineId);
      setSelectedPipelineId(remainingPipelines[0]?.id || null);
      
      toast.success(
        settings?.language === "en"
          ? "Pipeline deleted successfully"
          : "Pipeline erfolgreich gelöscht"
      );
      setShowDeleteDialog(false);
      setIsEditMode(false);
      onEditModeChange?.(false);
    } catch (error) {
      console.error("Error deleting pipeline:", error);
      toast.error(
        settings?.language === "en"
          ? "Failed to delete pipeline"
          : "Fehler beim Löschen der Pipeline"
      );
    }
  };

  return {
    pipelines,
    isEditMode,
    setIsEditMode,
    editingPipelineName,
    setEditingPipelineName,
    showDeleteDialog,
    setShowDeleteDialog,
    handleEditModeToggle,
    handleSaveChanges,
    handleDeletePipeline,
  };
};
