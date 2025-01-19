import { useDroppable } from "@dnd-kit/core";
import { Tables } from "@/integrations/supabase/types";
import { SortableLeadItem } from "./SortableLeadItem";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { AddLeadButton } from "./AddLeadButton";

interface PhaseColumnProps {
  phase: Tables<"pipeline_phases">;
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
  isEditMode: boolean;
  onDeletePhase: () => void;
  onUpdatePhaseName: (newName: string) => void;
  pipelineId: string | null;
}

export const PhaseColumn = ({ 
  phase, 
  leads, 
  onLeadClick,
  isEditMode,
  onDeletePhase,
  onUpdatePhaseName,
  pipelineId
}: PhaseColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: phase.id,
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
      className={`bg-muted/50 rounded-lg flex flex-col min-w-[250px] w-[250px] h-full relative transition-colors duration-200 ${
        isOver ? 'ring-2 ring-primary/50 bg-primary/5 shadow-[0_-2px_4px_rgba(0,0,0,0.15)]' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="p-4 space-y-0 sticky top-0 bg-muted/50 backdrop-blur-sm z-10 border-b">
        <div className="flex items-center justify-between gap-2">
          {isEditMode ? (
            <>
              <Input
                value={editingName}
                onChange={handleNameChange}
                className="h-8"
              />
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
            <h3 className="font-medium text-lg tracking-tight">{phase.name}</h3>
          )}
        </div>
      </CardHeader>
      <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2 min-h-[calc(100vh-13rem)]">
          {leads.map((lead) => (
            <SortableLeadItem
              key={lead.id}
              lead={lead}
              onLeadClick={onLeadClick}
            />
          ))}
          {isHovered && !isEditMode && (
            <div className="sticky bottom-4 left-0 right-0 mt-4">
              <AddLeadButton phase={phase.id} pipelineId={pipelineId} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};