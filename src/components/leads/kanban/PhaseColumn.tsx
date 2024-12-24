import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
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
  const { setNodeRef } = useDroppable({
    id: phase.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className="bg-muted/50 p-4 rounded-lg flex flex-col"
    >
      <div className="mb-4">
        <div className="flex items-center justify-between border-b border-primary/20 pb-2">
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
      <SortableContext items={leads.map((l) => l.id)} strategy={rectSortingStrategy}>
        <div className="space-y-2 min-h-[200px] flex-1">
          {leads.map((lead) => (
            <SortableLeadItem
              key={lead.id}
              lead={lead}
              onLeadClick={onLeadClick}
            />
          ))}
        </div>
      </SortableContext>
      <div className="mt-4">
        <AddLeadButton phase={phase.name} />
      </div>
    </div>
  );
};