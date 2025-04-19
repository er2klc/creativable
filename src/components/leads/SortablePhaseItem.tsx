
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LeadAvatar } from "./LeadAvatar";

interface Phase {
  id: string;
  name: string;
  order_index: number;
  leads?: any[];
}

interface SortablePhaseItemProps {
  phase: Phase;
}

export const SortablePhaseItem = ({ phase }: SortablePhaseItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: phase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-4 rounded-lg shadow min-w-[300px] cursor-grab touch-manipulation"
    >
      <h3 className="font-semibold mb-4">{phase.name}</h3>
      {phase.leads?.map((lead) => (
        <div key={lead.id} className="bg-gray-50 p-3 rounded mb-2">
          <div className="flex items-center gap-2">
            <LeadAvatar lead={lead} />
            <span>{lead.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
