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

  // Filter out "Aktive Partner" phase
  const filteredPhases = phases.filter(phase => phase.name !== "Aktive Partner");
  
  // Split phases into two rows
  const midPoint = Math.ceil(filteredPhases.length / 2);
  const topRowPhases = filteredPhases.slice(0, midPoint);
  const bottomRowPhases = filteredPhases.slice(midPoint);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;

    const leadId = active.id as string;
    const newPhaseId = over.id as string;
    
    if (newPhaseId && !isEditMode) {
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

  // Get active partners
  const activePartners = leads.filter(lead => lead.status === 'partner');

  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="mt-6 border-t border-gray-200 shadow-sm pt-6">
        <div className="flex-1 overflow-x-auto no-scrollbar relative">
          {/* Top Row */}
          <div className="flex gap-4 px-4 mb-4">
            {topRowPhases.map((phase, index) => (
              <div key={phase.id} className="flex-1" style={{ minWidth: '190px' }}>
                <PhaseColumn
                  phase={phase}
                  leads={leads.filter((lead) => lead.phase_id === phase.id)}
                  onLeadClick={handleLeadClick}
                  isEditMode={isEditMode}
                  onDeletePhase={() => setPhaseToDelete(phase)}
                  onUpdatePhaseName={(newName) => updatePhaseName.mutate({ id: phase.id, name: newName })}
                  pipelineId={selectedPipelineId}
                  isFirst={index === 0}
                  isLast={index === topRowPhases.length - 1}
                  onMovePhase={
                    isEditMode 
                      ? (direction) => handleMovePhase(phase.id, direction)
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          {/* Bottom Row */}
          <div className="flex gap-4 px-4">
            {bottomRowPhases.map((phase, index) => (
              <div key={phase.id} className="flex-1" style={{ minWidth: '190px' }}>
                <PhaseColumn
                  phase={phase}
                  leads={leads.filter((lead) => lead.phase_id === phase.id)}
                  onLeadClick={handleLeadClick}
                  isEditMode={isEditMode}
                  onDeletePhase={() => setPhaseToDelete(phase)}
                  onUpdatePhaseName={(newName) => updatePhaseName.mutate({ id: phase.id, name: newName })}
                  pipelineId={selectedPipelineId}
                  isFirst={index === 0}
                  isLast={index === bottomRowPhases.length - 1}
                  onMovePhase={
                    isEditMode 
                      ? (direction) => handleMovePhase(phase.id, direction)
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          {/* Active Partners Section */}
          {activePartners.length > 0 && (
            <div className="mt-8 px-4">
              <h2 className="text-lg font-semibold mb-4">Aktive Partner ({activePartners.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activePartners.map((partner) => (
                  <div 
                    key={partner.id}
                    className="bg-white p-4 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleLeadClick(partner.id)}
                  >
                    <div className="flex items-center gap-3">
                      {partner.social_media_profile_image_url ? (
                        <img 
                          src={partner.social_media_profile_image_url} 
                          alt={partner.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{partner.name}</h3>
                        {partner.social_media_username && (
                          <p className="text-sm text-gray-500">@{partner.social_media_username}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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