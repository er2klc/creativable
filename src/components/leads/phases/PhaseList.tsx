import { SortablePhase } from "../SortablePhase";
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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Tables } from "@/integrations/supabase/types";

interface PhaseListProps {
  phases: Tables<"pipeline_phases">[];
  onPhaseOrderChange: (newPhases: Tables<"pipeline_phases">[]) => void;
  onDeletePhase: (phase: { id: string; name: string }) => void;
}

export const PhaseList = ({ phases, onPhaseOrderChange, onDeletePhase }: PhaseListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = phases.findIndex((phase) => phase.id === active.id);
      const newIndex = phases.findIndex((phase) => phase.id === over.id);
      const newPhases = arrayMove(phases, oldIndex, newIndex);
      onPhaseOrderChange(newPhases);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={phases.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {phases.map((phase) => (
            <SortablePhase
              key={phase.id}
              phase={phase}
              onDelete={() => onDeletePhase(phase)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};