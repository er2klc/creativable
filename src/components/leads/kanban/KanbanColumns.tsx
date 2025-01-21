import { FC } from "react";
import { PhaseColumn } from "./PhaseColumn";
import { AddPhaseButton } from "./AddPhaseButton";
import { Tables } from "@/integrations/supabase/types";

interface KanbanColumnsProps {
  phases: Tables<"pipeline_phases">[];
  leads: Tables<"leads">[];
  isEditMode: boolean;
  selectedPipelineId: string | null;
  onLeadClick: (id: string) => void;
  onDeletePhase: (phase: { id: string; name: string }) => void;
  onUpdatePhaseName: (id: string, name: string) => void;
  onMovePhase: (phaseId: string, direction: 'left' | 'right') => void;
}

export const KanbanColumns: FC<KanbanColumnsProps> = ({
  phases,
  leads,
  isEditMode,
  selectedPipelineId,
  onLeadClick,
  onDeletePhase,
  onUpdatePhaseName,
  onMovePhase,
}) => {
  return (
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
  );
};