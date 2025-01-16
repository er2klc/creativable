import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/integrations/supabase/types";
import { LeadDetailView } from "../LeadDetailView";
import { useState } from "react";

interface SortableLeadItemProps {
  lead: Tables<"leads">;
  onLeadClick: (id: string) => void;
}

export const SortableLeadItem = ({ lead, onLeadClick }: SortableLeadItemProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lead.id,
    data: lead
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: isDragging ? 'relative' as const : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  // Handle click event only when not dragging
  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.preventDefault();
      e.stopPropagation();
      setIsEditDialogOpen(true);
    }
  };

  // Determine background style based on contact type
  const getBackgroundStyle = () => {
    const types = lead.contact_type?.split(',') || [];
    const isPartner = types.includes('Partner');
    const isKunde = types.includes('Kunde');

    if (isPartner && isKunde) {
      return 'bg-gradient-to-r from-[#E5DEFF]/30 to-[#F2FCE2]/30';
    } else if (isPartner) {
      return 'bg-gradient-to-r from-[#E5DEFF]/30 to-[#F1F0FB]/30';
    } else if (isKunde) {
      return 'bg-gradient-to-r from-[#F2FCE2]/30 to-[#E8F5D9]/30';
    }
    return 'bg-white';
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`${getBackgroundStyle()} rounded-lg border border-[#8E9196]/30 shadow-sm hover:shadow-md transition-all duration-200 group ${
          isDragging ? 'shadow-lg ring-2 ring-primary cursor-grabbing scale-105' : ''
        }`}
        {...attributes}
        {...listeners}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{lead.name}</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground mt-2">
            {lead.contact_type || "Nicht festgelegt"}
          </div>
        </div>
        <div 
          onClick={handleClick}
          className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg cursor-pointer"
        />
      </div>

      <LeadDetailView
        leadId={isEditDialogOpen ? lead.id : null}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};