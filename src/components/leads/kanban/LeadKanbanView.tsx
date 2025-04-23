
import { usePhaseQuery } from "./usePhaseQuery";
import { usePhaseMutations } from "./usePhaseMutations";
import { KanbanBoard } from "./KanbanBoard";
import { Tables } from "@/integrations/supabase/types";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string) => void;
  isEditMode: boolean;
}

export const LeadKanbanView = ({ 
  leads, 
  selectedPipelineId,
  setSelectedPipelineId,
  isEditMode 
}: LeadKanbanViewProps) => {
  const { data: phases = [] } = usePhaseQuery(selectedPipelineId);
  const { 
    updateLeadPhase, 
    updatePhaseName,
    deletePhase,
    updatePhaseOrder
  } = usePhaseMutations();

  const handleUpdatePhase = async (leadId: string, phaseId: string) => {
    const oldPhase = phases.find(phase => 
      leads.find(lead => lead.id === leadId)?.phase_id === phase.id
    );
    const newPhase = phases.find(phase => phase.id === phaseId);

    if (!oldPhase || !newPhase) return;

    await updateLeadPhase.mutate({
      leadId,
      phaseId,
      oldPhaseName: oldPhase.name,
      newPhaseName: newPhase.name
    });
  };

  const handleDeletePhase = async (phase: { id: string; name: string }) => {
    // Get the next phase to move leads to
    const nextPhase = phases.find(p => p.id !== phase.id);
    if (!nextPhase) return;

    await deletePhase.mutate({
      phaseId: phase.id,
      targetPhaseId: nextPhase.id
    });
  };

  const handleMovePhase = (phaseId: string, direction: 'left' | 'right') => {
    const currentPhases = [...phases];
    const phaseIndex = currentPhases.findIndex(p => p.id === phaseId);
    
    if (phaseIndex === -1) return;
    
    const newIndex = direction === 'left' 
      ? Math.max(0, phaseIndex - 1)
      : Math.min(currentPhases.length - 1, phaseIndex + 1);
    
    if (phaseIndex === newIndex) return;
    
    const updatedPhases = [...currentPhases];
    const [movedPhase] = updatedPhases.splice(phaseIndex, 1);
    updatedPhases.splice(newIndex, 0, movedPhase);
    
    // Update order_index for all phases
    const phasesWithNewOrder = updatedPhases.map((phase, index) => ({
      ...phase,
      order_index: index
    }));
    
    updatePhaseOrder.mutate(phasesWithNewOrder);
  };

  return (
    <KanbanBoard
      phases={phases}
      leads={leads}
      isEditMode={isEditMode}
      selectedPipelineId={selectedPipelineId}
      onLeadClick={(id) => {
        // Navigate to lead detail view
        window.location.href = `/contacts/${id}`;
      }}
      onUpdatePhase={handleUpdatePhase}
      onDeletePhase={handleDeletePhase}
      onUpdatePhaseName={(id, name) => updatePhaseName.mutate({ id, name })}
      onMovePhase={handleMovePhase}
    />
  );
};
