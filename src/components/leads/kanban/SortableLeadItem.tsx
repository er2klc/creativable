import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { User, Phone, MessageSquare, Share } from "lucide-react";
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

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  // Separate click handlers for each action
  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Message functionality will be implemented later
    console.log("Message clicked for lead:", lead.id);
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Call functionality will be implemented later
    if (lead.phone_number) {
      window.location.href = `tel:${lead.phone_number}`;
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Share functionality will be implemented later
    console.log("Share clicked for lead:", lead.id);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`bg-background p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group ${
          isDragging ? 'shadow-lg ring-2 ring-primary cursor-grabbing scale-105' : 'cursor-grab'
        }`}
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{lead.name}</span>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {lead.contact_type || "Nicht festgelegt"}
          </div>

          <div className="grid grid-cols-4 gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 hover:bg-accent/50"
              onClick={handleEditClick}
              title="Kontakt bearbeiten"
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 hover:bg-accent/50"
              onClick={handleCallClick}
              title="Anrufen"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 hover:bg-accent/50"
              onClick={handleMessageClick}
              title="Nachricht senden"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 hover:bg-accent/50"
              onClick={handleShareClick}
              title="Teilen"
            >
              <Share className="h-4 w-4" />
            </Button>
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