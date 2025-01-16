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
  const dragTimeoutRef = useRef<number | null>(null);

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
        opacity: isDragging ? 0.8 : 1, // Transparenz beim Draggen
      }
    : undefined;

  const handleMouseDown = () => {
    dragTimeoutRef.current = window.setTimeout(() => {
      setIsDragging(true);
    }, 150); // 150ms Verzögerung für Draggen
  };

  const handleMouseUp = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    if (!isDragging) {
      onLeadClick(lead.id); // Nur auslösen, wenn kein Dragging stattgefunden hat
    }
    setIsDragging(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-2 rounded-lg bg-white shadow-md border hover:shadow-lg transition-shadow",
        isDragging && "shadow-xl ring-2 ring-primary scale-105"
      )}
      {...attributes}
      {...listeners}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="font-medium">{lead.name}</div>
      <div className="text-sm text-gray-500">
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
