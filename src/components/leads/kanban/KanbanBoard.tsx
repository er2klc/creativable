
import { DndContext, DragEndEvent, closestCenter, DragOverlay } from "@dnd-kit/core";
import { Tables } from "@/integrations/supabase/types";
import { PhaseColumn } from "./PhaseColumn";
import { AddPhaseButton } from "./AddPhaseButton";
import { SortableLeadItem } from "./SortableLeadItem";
import { useState } from "react";

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
  const [activeLead, setActiveLead] = useState<Tables<"leads"> | null>(null);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const draggedLead = leads.find(lead => lead.id === active.id);
    if (draggedLead) {
      setActiveLead(draggedLead);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);
    
    if (!over || !active || isEditMode) return;

    const leadId = active.id as string;
    const newPhaseId = over.id as string;
    
    const lead = leads.find(l => l.id === leadId);
    if (lead?.phase_id === newPhaseId) {
      console.log("Phase unchanged, skipping update");
      return;
    }
    
    if (newPhaseId) {
      await onUpdatePhase(leadId, newPhaseId);
    }
  };

  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
    >
      <div className="mt-6 border-t border-gray-200 shadow-sm pt-6">
        <div className="flex-1 overflow-visible relative h-[calc(100vh)]">
          <div className="flex gap-2.5 h-full px-4" style={{ 
            minWidth: 'fit-content',
            position: 'relative',
            zIndex: 0
          }}>
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" style={{ zIndex: 2 }} />

            {phases.map((phase, index) => (
              <div 
                key={phase.id} 
                style={{ 
                  width: '240px',
                  minWidth: '200px',
                  flex: '1 1 auto',
                  position: 'relative',
                }}
              >
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

            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" style={{ zIndex: 2 }} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeLead ? (
          <div style={{ width: '240px' }}>
            <SortableLeadItem
              lead={activeLead}
              onLeadClick={onLeadClick}
              disabled={true}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

