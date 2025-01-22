import { useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { PhaseColumn } from "./kanban/PhaseColumn";
import { useKanbanSubscription } from "./kanban/useKanbanSubscription";
import { usePhaseQuery } from "./kanban/usePhaseQuery";
import { usePhaseMutations } from "./kanban/usePhaseMutations";
import { useNavigate } from "react-router-dom";
import { LeadFilters } from "./LeadFilters";
import { DeletePhaseDialog } from "./phases/DeletePhaseDialog";
import { AddPhaseButton } from "./kanban/AddPhaseButton";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
}

export const LeadKanbanView = ({ 
  leads, 
  selectedPipelineId,
  setSelectedPipelineId 
}: LeadKanbanViewProps) => {
  const { settings } = useSettings();
  const [isEditMode, setIsEditMode] = useState(false);
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
    const newPhase = over.id as string;
    
    if (newPhase && !isEditMode) {
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
      <div className="flex flex-col h-screen">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30 w-full border-b">
          <LeadFilters
            selectedPipelineId={selectedPipelineId}
            setSelectedPipelineId={setSelectedPipelineId}
            onEditModeChange={setIsEditMode}
          />
        </div>

        <div className="flex-1 overflow-x-auto no-scrollbar relative">
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