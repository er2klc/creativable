import { useSortable } from "@dnd-kit/sortable";
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
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: lead
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'pointer',
    position: isDragging ? 'relative' as const : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation();
      onLeadClick(lead.id);
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
        onClick={handleClick}
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
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
      </div>

      <LeadDetailView
        leadId={isEditDialogOpen ? lead.id : null}
        onClose={() => setIsEditDialogOpen(false)}
      />
    </>
  );
};