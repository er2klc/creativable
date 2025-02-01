import { useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { PhaseColumn } from "./kanban/PhaseColumn";
import { useKanbanSubscription } from "./kanban/useKanbanSubscription";
import { usePhaseQuery } from "./kanban/usePhaseQuery";
import { usePhaseMutations } from "./kanban/usePhaseMutations";
import { useNavigate } from "react-router-dom";
import { DeletePhaseDialog } from "./phases/DeletePhaseDialog";
import { AddPhaseButton } from "./kanban/AddPhaseButton";
import { supabase } from "@/integrations/supabase/client";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
  isEditMode?: boolean;
}

export const LeadKanbanView = ({ 
  leads, 
  selectedPipelineId,
  setSelectedPipelineId,
  isEditMode = false
}: LeadKanbanViewProps) => {
  const { settings } = useSettings();
  const [phaseToDelete, setPhaseToDelete] = useState<{ id: string; name: string } | null>(null);
  const [targetPhase, setTargetPhase] = useState<string>("");
  const { data: phases = [] } = usePhaseQuery(selectedPipelineId);
  const { updateLeadPhase, addPhase, updatePhaseName, deletePhase, updatePhaseOrder } = usePhaseMutations();
  const navigate = useNavigate();

  useKanbanSubscription();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;

    const leadId = active.id as string;
    const newPhaseId = over.id as string;
    
    if (newPhaseId && !isEditMode) {
      try {
        // Get the old and new phase names for the note
        const oldPhase = phases.find(p => p.id === leads.find(l => l.id === leadId)?.phase_id)?.name || '';
        const newPhase = phases.find(p => p.id === newPhaseId)?.name || '';

        // Update the lead's phase
        await updateLeadPhase.mutateAsync({ 
          leadId, 
          phaseId: newPhaseId 
        });

        // Create a note to track the phase change
        const { error: noteError } = await supabase
          .from('notes')
          .insert({
            lead_id: leadId,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            content: `Phase von "${oldPhase}" zu "${newPhase}" geändert`,
            color: '#E9D5FF',
            metadata: {
              type: 'phase_change',
              oldPhase,
              newPhase
            }
          });

        if (noteError) {
          console.error("Error creating phase change note:", noteError);
        }
      } catch (error) {
        console.error("Error updating lead phase:", error);
      }
    }
  };

  const handleLeadClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  const handleDeletePhase = async () => {
    if (!phaseToDelete || !targetPhase) return;

    try {
      await deletePhase.mutateAsync({ 
        phaseId: phaseToDelete.id, 
        targetPhaseId: targetPhase 
      });
      setPhaseToDelete(null);
      setTargetPhase("");
    } catch (error) {
      console.error("Error deleting phase:", error);
    }
  };

  const handleMovePhase = async (phaseId: string, direction: 'left' | 'right') => {
    const currentIndex = phases.findIndex(p => p.id === phaseId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= phases.length) return;

    const updatedPhases = [...phases];
    const [movedPhase] = updatedPhases.splice(currentIndex, 1);
    updatedPhases.splice(newIndex, 0, movedPhase);

    const phasesWithNewOrder = updatedPhases.map((phase, index) => ({
      ...phase,
      order_index: index
    }));

    try {
      await updatePhaseOrder.mutateAsync(phasesWithNewOrder);
    } catch (error) {
      console.error("Error updating phase order:", error);
    }
  };

  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="mt-6 border-t border-gray-200 shadow-sm pt-6">
    <div className="flex-1 overflow-x-auto no-scrollbar relative h-[calc(100vh)]">
          <div 
            className="flex gap-4 px-4 h-full" 
            style={{ minWidth: 'fit-content' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />

            {phases.map((phase, index) => (
              <div key={phase.id} className="flex-1" style={{ minWidth: '190px', width: `${100 / phases.length}%` }}>
                <PhaseColumn
                  phase={phase}
                  leads={leads.filter((lead) => lead.phase_id === phase.id)}
                  onLeadClick={handleLeadClick}
                  isEditMode={isEditMode}
                  onDeletePhase={() => setPhaseToDelete(phase)}
                  onUpdatePhaseName={(newName) => updatePhaseName.mutate({ id: phase.id, name: newName })}
                  pipelineId={selectedPipelineId}
                  isFirst={index === 0}
                  isLast={index === phases.length - 1}
                  onMovePhase={
                    isEditMode 
                      ? (direction) => handleMovePhase(phase.id, direction)
                      : undefined
                  }
                />
              </div>
            ))}

            {isEditMode && (
              <AddPhaseButton pipelineId={selectedPipelineId} />
            )}

            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>
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
    </DndContext>
  );
};