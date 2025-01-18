import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PhaseColumn } from "./kanban/PhaseColumn";
import { useKanbanSubscription } from "./kanban/useKanbanSubscription";
import { usePhaseQuery } from "./kanban/usePhaseQuery";
import { usePhaseMutations } from "./kanban/usePhaseMutations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Pencil, Save, UserPlus, Plus } from "lucide-react";
import { AddLeadDialog } from "./AddLeadDialog";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  selectedPipelineId: string | null;
}

export const LeadKanbanView = ({ leads, selectedPipelineId }: LeadKanbanViewProps) => {
  const { settings } = useSettings();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPipelineName, setEditingPipelineName] = useState("");
  const { data: phases = [] } = usePhaseQuery(selectedPipelineId);
  const { updateLeadPhase, addPhase, updatePhaseName, deletePhase } = usePhaseMutations();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Use the subscription hook
  useKanbanSubscription();

  const updatePipelineName = useMutation({
    mutationFn: async (newName: string) => {
      if (!selectedPipelineId) return;

      const { error } = await supabase
        .from("pipelines")
        .update({ name: newName })
        .eq("id", selectedPipelineId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      toast.success(
        settings?.language === "en" 
          ? "Pipeline name updated successfully" 
          : "Pipeline-Name erfolgreich aktualisiert"
      );
    },
    onError: (error) => {
      console.error("Error updating pipeline name:", error);
      toast.error(
        settings?.language === "en"
          ? "Failed to update pipeline name"
          : "Fehler beim Aktualisieren des Pipeline-Namens"
      );
    },
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;

    const leadId = active.id as string;
    const newPhase = over.id as string;
    
    if (newPhase) {
      try {
        await updateLeadPhase.mutateAsync({ 
          leadId, 
          phaseId: newPhase 
        });
      } catch (error) {
        console.error("Error updating lead phase:", error);
      }
    }
  };

  const handleLeadClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  const handleSaveChanges = async () => {
    if (editingPipelineName) {
      await updatePipelineName.mutateAsync(editingPipelineName);
    }
    setIsEditMode(false);
  };

  const handleEditModeToggle = () => {
    const currentPipeline = phases[0]?.pipeline_id ? {
      name: phases[0]?.name || ""
    } : null;
    
    setIsEditMode(!isEditMode);
    setEditingPipelineName(currentPipeline?.name || "");
  };

  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-[calc(100vh-13rem)] overflow-hidden relative">
        <div className="flex justify-between items-center mb-4 px-4">
          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Input
                  value={editingPipelineName}
                  onChange={(e) => setEditingPipelineName(e.target.value)}
                  className="max-w-xs"
                  placeholder={settings?.language === "en" ? "Pipeline name" : "Pipeline-Name"}
                />
                <Button onClick={handleSaveChanges} variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {settings?.language === "en" ? "Save Changes" : "Änderungen speichern"}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleEditModeToggle} variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  {settings?.language === "en" ? "Edit Pipeline" : "Pipeline bearbeiten"}
                </Button>
                <AddLeadDialog
                  trigger={
                    <Button variant="outline" size="icon" className="h-9 w-9">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  }
                  defaultPhase={phases[0]?.id}
                  pipelineId={selectedPipelineId}
                />
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Plus className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="w-full h-full overflow-x-auto no-scrollbar">
          <div 
            className="flex gap-4 px-4 relative min-h-full" 
            style={{ 
              minWidth: `${phases.length * 280 + ((phases.length - 1) * 16)}px`,
              maxWidth: '100%'
            }}
          >
            {/* Shadow indicator for left scroll */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />

            {phases.map((phase) => (
              <div key={phase.id} className="flex-1 min-w-[280px] max-w-[300px]">
                <PhaseColumn
                  phase={phase}
                  leads={leads.filter((lead) => lead.phase_id === phase.id)}
                  onLeadClick={handleLeadClick}
                  isEditMode={isEditMode}
                  onDeletePhase={() => deletePhase.mutate(phase.id)}
                  onUpdatePhaseName={(newName) => updatePhaseName.mutate({ id: phase.id, name: newName })}
                  pipelineId={selectedPipelineId}
                />
              </div>
            ))}

            {/* Shadow indicator for right scroll */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>
    </DndContext>
  );
};