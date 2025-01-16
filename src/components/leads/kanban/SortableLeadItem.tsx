import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tables } from "@/integrations/supabase/types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { LeadDetailView } from "../LeadDetailView";

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
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? 'relative' as const : undefined,
    opacity: isDragging ? 0.9 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      setIsEditDialogOpen(true);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        onClick={handleClick}
        className={`bg-background rounded-lg border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer ${
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl">
          <LeadDetailView leadId={lead.id} onClose={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};