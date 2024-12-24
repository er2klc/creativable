import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Star, Send, Instagram, Linkedin, Facebook, Video } from "lucide-react";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { Tables } from "@/integrations/supabase/types";

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "instagram":
      return <Instagram className="h-4 w-4" />;
    case "linkedin":
      return <Linkedin className="h-4 w-4" />;
    case "facebook":
      return <Facebook className="h-4 w-4" />;
    case "tiktok":
      return <Video className="h-4 w-4" />;
    default:
      return null;
  }
};

interface SortableLeadItemProps {
  lead: Tables<"leads">;
  onLeadClick: (id: string) => void;
}

export const SortableLeadItem = ({ lead, onLeadClick }: SortableLeadItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    touchAction: 'none' as const,
    position: isDragging ? 'relative' as const : 'static' as const,
    zIndex: isDragging ? 9999 : 'auto',
    pointerEvents: isDragging ? 'none' as const : undefined,
    backgroundColor: isDragging ? 'var(--background)' : undefined,
    boxShadow: isDragging ? '0 10px 25px -5px rgba(0, 0, 0, 0.1)' : undefined,
    width: isDragging ? '100%' : undefined,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if we're not dragging
    if (!isDragging) {
      onLeadClick(lead.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={`bg-background p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group ${
        isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getPlatformIcon(lead.platform)}
          <span className="font-medium">{lead.name}</span>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <SendMessageDialog
            lead={lead}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <Send className="h-4 w-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Star className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="text-sm text-muted-foreground mt-2">
        {lead.contact_type || "Nicht festgelegt"}
      </div>
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
    </div>
  );
};