import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/integrations/supabase/types";
import { LeadDetailView } from "../LeadDetailView";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SortableLeadItemProps {
  lead: Tables<"leads">;
  onLeadClick: (id: string) => void;
}

const SortableLeadItem = ({ lead, onLeadClick }: SortableLeadItemProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: lead.id,
    data: lead,
  });

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = () => setIsDragging(false);

  return (
    <div
  ref={setNodeRef}
  style={style}
  className={cn(
    "p-3 rounded-lg bg-white shadow-md border hover:shadow-lg transition-shadow",
    isDragging && "opacity-75"
  )}
  {...attributes}
  {...listeners}
  onClick={() => !isDragging && onLeadClick(lead.id)}
>
  <div className="font-bold text-lg">{lead.name}</div>
  <div className="text-sm text-gray-500">{lead.contact_type || "Nicht festgelegt"}</div>
</div>
    </div>
  );
};

      <LeadDetailView
        leadId={isEditDialogOpen ? lead.id : null}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};
