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
        "p-2 rounded hover:opacity-80 space-y-1 border shadow-sm",
        isDragging && "shadow-lg ring-2 ring-primary scale-[1.02]"
      )}
      {...attributes}
      {...listeners}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onClick={() => !isDragging && onLeadClick(lead.id)} // Nur wenn kein Drag
    >
      <div className="font-medium">{lead.name}</div>
      <div className="text-sm text-muted-foreground">
        {lead.contact_type || "Nicht festgelegt"}
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
