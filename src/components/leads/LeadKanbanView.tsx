
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { DeletePhaseDialog } from "./phases/DeletePhaseDialog";
import { usePhaseQuery } from "./kanban/usePhaseQuery";
import { usePhaseMutations } from "./kanban/usePhaseMutations";
import { useLeadsSubscription } from "./kanban/hooks/useLeadsSubscription";
import { KanbanBoard } from "./kanban/KanbanBoard";

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

  // Subscribe to lead changes
  useLeadsSubscription(selectedPipelineId);

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

  const handleUpdatePhase = async (leadId: string, newPhaseId: string) => {
    try {
      const oldPhase = phases.find(p => p.id === leads.find(l => l.id === leadId)?.phase_id)?.name || '';
      const newPhase = phases.find(p => p.id === newPhaseId)?.name || '';

      await updateLeadPhase.mutateAsync({ 
        leadId, 
        phaseId: newPhaseId,
        oldPhaseName: oldPhase,
        newPhaseName: newPhase
      });
    } catch (error) {
      console.error("Error updating lead phase:", error);
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
    <>
      <KanbanBoard
        phases={phases}
        leads={leads}
        isEditMode={isEditMode}
        selectedPipelineId={selectedPipelineId}
        onLeadClick={handleLeadClick}
        onUpdatePhase={handleUpdatePhase}
        onDeletePhase={setPhaseToDelete}
        onUpdatePhaseName={updatePhaseName.mutate}
        onMovePhase={handleMovePhase}
      />

      <DeletePhaseDialog
        phaseToDelete={phaseToDelete}
        targetPhase={targetPhase}
        setTargetPhase={setTargetPhase}
        onClose={() => setPhaseToDelete(null)}
        onConfirm={handleDeletePhase}
        phases={phases}
      />
    </>
  );
};
