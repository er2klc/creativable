import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

interface CompactPhaseSelectorProps {
  lead: Tables<"leads">;
  phases: Tables<"lead_phases">[];
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onUpdatePhases?: (phases: Tables<"lead_phases">[]) => void;
}

function SortablePhase({ phase, isActive, onClick }: { 
  phase: Tables<"lead_phases">;
  isActive: boolean;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: phase.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "px-3 py-1 text-sm rounded-full cursor-pointer transition-all transform hover:scale-105",
        isActive
          ? "bg-[#D3E4FD] text-blue-800 shadow-sm"
          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
      )}
    >
      {phase.name}
    </div>
  );
}

export function CompactPhaseSelector({ 
  lead, 
  phases, 
  onUpdateLead,
  onUpdatePhases 
}: CompactPhaseSelectorProps) {
  const { settings } = useSettings();
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && onUpdatePhases) {
      const oldIndex = phases.findIndex((p) => p.id === active.id);
      const newIndex = phases.findIndex((p) => p.id === over.id);
      
      const updatedPhases = arrayMove(phases, oldIndex, newIndex);
      const phasesWithNewOrder = updatedPhases.map((phase, index) => ({
        ...phase,
        order_index: index,
      }));
      
      onUpdatePhases(phasesWithNewOrder);
    }
  };

  return (
    <div className="w-full p-4 rounded-lg">
      <h3 className="text-sm font-medium mb-3 text-gray-700">
        {settings?.language === "en" ? "Contact Phase" : "Kontaktphase"}
      </h3>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={phases.map((p) => p.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex gap-2 flex-wrap">
            {phases.map((phase) => (
              <SortablePhase
                key={phase.id}
                phase={phase}
                isActive={lead.phase === phase.name}
                onClick={() => onUpdateLead({ phase: phase.name })}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}