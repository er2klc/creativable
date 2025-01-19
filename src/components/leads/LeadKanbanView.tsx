import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { usePhaseQuery, usePhaseMutations } from "./kanban/usePhaseQuery";
import { PhaseColumn } from "./kanban/PhaseColumn";
import { useQueryClient } from "@tanstack/react-query";
import { DeletePhaseDialog } from "./phases/DeletePhaseDialog";

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
  const { updateLeadPhase, deletePhase } = usePhaseMutations();
  const queryClient = useQueryClient();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const leadId = active.id as string;
    const newPhaseId = over.id as string;
    
    if (leadId && newPhaseId) {
      try {
        await updateLeadPhase.mutateAsync({
          leadId,
          newPhaseId
        });
        
        // Invalidate queries to refresh the data
        await queryClient.invalidateQueries({ queryKey: ['leads'] });
      } catch (error) {
        console.error('Error updating lead phase:', error);
      }
    }
  };

  const handleDeletePhase = async () => {
    if (!phaseToDelete || !targetPhase) return;

    try {
      await deletePhase.mutateAsync(phaseToDelete.id);
      setPhaseToDelete(null);
      setTargetPhase("");
    } catch (error) {
      console.error("Error deleting phase:", error);
    }
  };

  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-[calc(100vh-13rem)] overflow-hidden relative">
        <div className="flex justify-between items-center mb-4 px-4">
          <div className="flex items-center gap-2">
            {isEditMode && (
              <Button onClick={onSaveChanges} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                {settings?.language === "en" ? "Save Changes" : "Änderungen speichern"}
              </Button>
            )}
          </div>
        </div>

        <div className="relative flex-1 overflow-x-auto">
          <div className="flex gap-4 p-4">
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
                  onUpdatePhaseName={(newName) => updatePhaseName.mutate({ id: phase.id, name: newName })}
                  pipelineId={selectedPipelineId}
                />
              ))}
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