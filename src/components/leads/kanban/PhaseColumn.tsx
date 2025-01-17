import { useDroppable } from "@dnd-kit/core";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { SortableLeadItem } from "./SortableLeadItem";
import { AddLeadButton } from "./AddLeadButton";

interface PhaseColumnProps {
  phase: Tables<"lead_phases">;
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
  onEditPhase: (phase: Tables<"lead_phases">) => void;
}

export const PhaseColumn = ({ phase, leads, onLeadClick, onEditPhase }: PhaseColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: phase.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`bg-muted/50 rounded-lg flex flex-col h-full relative transition-colors duration-200 ${
        isOver ? 'ring-2 ring-primary/50 bg-primary/5' : ''
      }`}
    >
      <div className="sticky top-0 z-10 bg-[#f5f5f5] p-4 rounded-t-lg border-b border-primary/20 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg tracking-tight">{phase.name}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEditPhase(phase)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
        <div className="space-y-2">
          {leads.map((lead) => (
            <SortableLeadItem
              key={lead.id}
              lead={lead}
              onLeadClick={onLeadClick}
            />
          ))}
        </div>
        <div className="mt-4">
          <AddLeadButton phase={phase.name} />
        </div>
      </div>
    </div>
  );
};