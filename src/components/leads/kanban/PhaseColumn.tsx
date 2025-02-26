
import { useDroppable } from "@dnd-kit/core";
import { Tables } from "@/integrations/supabase/types";
import { SortableLeadItem } from "./SortableLeadItem";
import { Card, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { AddLeadButton } from "./AddLeadButton";
import { PhaseHeader } from "./phase-header/PhaseHeader";
import { PlatformStats } from "./phase-stats/PlatformStats";

interface PhaseColumnProps {
  phase: Tables<"pipeline_phases">;
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
  isEditMode: boolean;
  onDeletePhase: () => void;
  onUpdatePhaseName: (newName: string) => void;
  pipelineId: string | null;
  isFirst?: boolean;
  isLast?: boolean;
  onMovePhase?: (direction: 'left' | 'right') => void;
}

export const PhaseColumn = ({ 
  phase, 
  leads, 
  onLeadClick,
  isEditMode,
  onDeletePhase,
  onUpdatePhaseName,
  pipelineId,
  isFirst = false,
  isLast = false,
  onMovePhase
}: PhaseColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: phase.id,
    disabled: isEditMode,
  });

  const [editingName, setEditingName] = useState(phase.name);
  const [isHovered, setIsHovered] = useState(false);

  const handleNameChange = (newName: string) => {
    setEditingName(newName);
    onUpdatePhaseName(newName);
  };

  return (
    <Card
      ref={setNodeRef}
      className={`h-full flex flex-col bg-muted/50 rounded-lg relative transition-colors duration-200 ${
        isOver && !isEditMode ? 'ring-2 ring-primary/50 bg-primary/5 shadow-[0_-2px_4px_rgba(0,0,0,0.15)]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-2 space-y-0 sticky top-0 bg-muted/50 backdrop-blur-sm z-[5] border-b shadow-sm">
        <PhaseHeader
          name={phase.name}
          isEditMode={isEditMode}
          editingName={editingName}
          isFirst={isFirst}
          isLast={isLast}
          onUpdatePhaseName={handleNameChange}
          onDeletePhase={onDeletePhase}
          onMovePhase={onMovePhase}
        />
        {!isEditMode && leads.length > 0 && (
          <PlatformStats leads={leads} />
        )}
      </CardHeader>

      <div className="flex-1 overflow-y-auto no-scrollbar max-h-[calc(100vh-12rem)]">
        <div className="space-y-2 p-4">
          {leads.map((lead) => (
            <SortableLeadItem
              key={lead.id}
              lead={lead}
              onLeadClick={onLeadClick}
              disabled={isEditMode}
            />
          ))}
          {isHovered && !isEditMode && (
            <AddLeadButton phase={phase.id} pipelineId={pipelineId} />
          )}
        </div>
      </div>
    </Card>
  );
};
