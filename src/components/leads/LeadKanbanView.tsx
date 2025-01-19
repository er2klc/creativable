import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { 
  SortableContext, 
  horizontalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { usePhaseQuery } from "./kanban/usePhaseQuery";
import { usePhaseMutations } from "./kanban/usePhaseMutations";
import { PhaseColumn } from "./kanban/PhaseColumn";
import { useQueryClient } from "@tanstack/react-query";
import { DeletePhaseDialog } from "./phases/DeletePhaseDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useKanbanSubscription } from "./kanban/useKanbanSubscription";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  selectedPipelineId: string | null;
  handleLeadClick: (leadId: string) => void;
  isEditMode: boolean;
  onSaveChanges: () => void;
}

export const LeadKanbanView = ({ 
  leads, 
  selectedPipelineId, 
  handleLeadClick,
  isEditMode,
  onSaveChanges
}: LeadKanbanViewProps) => {
  const { settings } = useSettings();
  const [phaseToDelete, setPhaseToDelete] = useState<{ id: string; name: string } | null>(null);
  const [targetPhase, setTargetPhase] = useState<string>("");
  const { data: phases = [] } = usePhaseQuery(selectedPipelineId);
  const { updateLeadPhase, updatePhaseName, deletePhase, addPhase, updatePhaseOrder } = usePhaseMutations();
  const queryClient = useQueryClient();

  // Set up realtime subscriptions
  useKanbanSubscription();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (isEditMode) {
      // Handle phase reordering
      const oldIndex = phases.findIndex(p => p.id === active.id);
      const newIndex = phases.findIndex(p => p.id === over.id);
      
      if (oldIndex !== newIndex) {
        const newPhases = arrayMove(phases, oldIndex, newIndex);
        try {
          await updatePhaseOrder.mutateAsync(
            newPhases.map((phase, index) => ({
              id: phase.id,
              name: phase.name,
              pipeline_id: phase.pipeline_id,
              order_index: index
            }))
          );
        } catch (error) {
          console.error('Error updating phase order:', error);
        }
      }
    } else {
      // Handle lead movement between phases
      const leadId = active.id as string;
      const phaseId = over.id as string;
      
      if (leadId && phaseId) {
        try {
          await updateLeadPhase.mutateAsync({
            leadId,
            phaseId
          });
        } catch (error) {
          console.error('Error updating lead phase:', error);
        }
      }
    }
  };

  const handleDeletePhase = async () => {
    if (!phaseToDelete) return;

    try {
      await deletePhase.mutateAsync(phaseToDelete.id);
      setPhaseToDelete(null);
      setTargetPhase("");
    } catch (error) {
      console.error("Error deleting phase:", error);
    }
  };

  const handleUpdatePhaseName = async (phaseId: string, newName: string) => {
    try {
      await updatePhaseName.mutateAsync({ id: phaseId, name: newName });
    } catch (error) {
      console.error("Error updating phase name:", error);
    }
  };

  const handleAddPhase = async () => {
    if (!selectedPipelineId) return;
    try {
      await addPhase.mutateAsync({
        name: settings?.language === "en" ? "New Phase" : "Neue Phase",
        pipelineId: selectedPipelineId
      });
    } catch (error) {
      console.error("Error adding phase:", error);
    }
  };

  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-[calc(100vh-13rem)] overflow-hidden relative">
        <div className="relative flex-1 overflow-x-auto">
          <div className="flex gap-4 p-4 min-h-[calc(100vh-13rem)]">
            <SortableContext 
              items={phases.map(phase => phase.id)}
              strategy={horizontalListSortingStrategy}
            >
              {phases.map((phase) => (
                <PhaseColumn
                  key={phase.id}
                  phase={phase}
                  leads={leads.filter((lead) => lead.phase_id === phase.id)}
                  onLeadClick={handleLeadClick}
                  isEditMode={isEditMode}
                  onDeletePhase={() => setPhaseToDelete(phase)}
                  onUpdatePhaseName={(newName) => handleUpdatePhaseName(phase.id, newName)}
                  pipelineId={selectedPipelineId}
                />
              ))}
              {isEditMode && (
                <Button
                  onClick={handleAddPhase}
                  variant="ghost"
                  className="min-w-[250px] h-[calc(100vh-13rem)] border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors"
                >
                  <Plus className="h-6 w-6 mr-2" />
                  {settings?.language === "en" ? "Add Phase" : "Phase hinzufügen"}
                </Button>
              )}
            </SortableContext>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>
        </div>

        <DeletePhaseDialog
          phaseToDelete={phaseToDelete}
          targetPhase={targetPhase}
          setTargetPhase={setTargetPhase}
          onClose={() => setPhaseToDelete(null)}
          onConfirm={handleDeletePhase}
          phases={phases}
        />
      </div>
    </DndContext>
  );
};