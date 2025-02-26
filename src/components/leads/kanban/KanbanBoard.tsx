
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { Tables } from "@/integrations/supabase/types";
import { PhaseColumn } from "./PhaseColumn";
import { AddPhaseButton } from "./AddPhaseButton";

interface KanbanBoardProps {
  phases: Tables<"pipeline_phases">[];
  leads: Tables<"leads">[];
  isEditMode: boolean;
  selectedPipelineId: string | null;
  onLeadClick: (id: string) => void;
  onUpdatePhase: (leadId: string, phaseId: string) => Promise<void>;
  onDeletePhase: (phase: { id: string; name: string }) => void;
  onUpdatePhaseName: (id: string, name: string) => void;
  onMovePhase: (phaseId: string, direction: 'left' | 'right') => void;
}

export const KanbanBoard = ({
  phases,
  leads,
  isEditMode,
  selectedPipelineId,
  onLeadClick,
  onUpdatePhase,
  onDeletePhase,
  onUpdatePhaseName,
  onMovePhase,
}: KanbanBoardProps) => {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !active || isEditMode) return;

    const leadId = active.id as string;
    const newPhaseId = over.id as string;
    
    // Get old and new phase names for the note
    const lead = leads.find(l => l.id === leadId);
    const oldPhase = phases.find(p => p.id === lead?.phase_id)?.name || '';
    const newPhase = phases.find(p => p.id === newPhaseId)?.name || '';

    if (newPhaseId && oldPhase && newPhase) {
      try {
        console.log('Starting phase update:', { leadId, newPhaseId, oldPhase, newPhase });
        await onUpdatePhase(leadId, newPhaseId);
        console.log('Phase update completed successfully');
      } catch (error) {
        console.error('Error updating phase:', error);
      }
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="mt-6 border-t border-gray-200 shadow-sm pt-6">
        <div className="flex-1 overflow-x-auto no-scrollbar relative h-[calc(100vh)]">
          <div className="flex gap-4 px-4 h-full" style={{ minWidth: 'fit-content' }}>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />

            {phases.map((phase, index) => (
              <div key={phase.id} className="flex-1" style={{ minWidth: '190px', width: `${100 / phases.length}%` }}>
                <PhaseColumn
                  phase={phase}
                  leads={leads.filter((lead) => lead.phase_id === phase.id)}
                  onLeadClick={onLeadClick}
                  isEditMode={isEditMode}
                  onDeletePhase={() => onDeletePhase(phase)}
                  onUpdatePhaseName={(newName) => onUpdatePhaseName(phase.id, newName)}
                  pipelineId={selectedPipelineId}
                  isFirst={index === 0}
                  isLast={index === phases.length - 1}
                  onMovePhase={
                    isEditMode 
                      ? (direction) => onMovePhase(phase.id, direction)
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
    </DndContext>
  );
};
