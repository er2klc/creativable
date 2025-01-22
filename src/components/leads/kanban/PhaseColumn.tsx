import { useDroppable } from "@dnd-kit/core";
import { Tables } from "@/integrations/supabase/types";
import { SortableLeadItem } from "./SortableLeadItem";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddLeadButton } from "./AddLeadButton";
import { usePhaseMutations } from "./usePhaseMutations";

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
    onUpdatePhaseName(e.target.value);
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
      <CardHeader className="p-2 space-y-0 sticky top-0 bg-muted/50 backdrop-blur-sm z-10 border-b">
        <div className="flex items-center justify-between gap-2">
          {isEditMode ? (
            <>
              <div className="flex items-center gap-2 flex-1">
                {!isFirst && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMovePhase?.('left')}
                    className="h-8 w-8 hover:bg-primary/10"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <Input
                  value={editingName}
                  onChange={handleNameChange}
                  className="h-8"
                />
                {!isLast && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onMovePhase?.('right')}
                    className="h-8 w-8 hover:bg-primary/10"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDeletePhase}
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <h3 className="font-medium text-sm tracking-tight">{phase.name}</h3>
          )}
        </div>
      </CardHeader>
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2 p-4 pb-14">
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
