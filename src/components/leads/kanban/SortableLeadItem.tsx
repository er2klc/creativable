import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Star, Send } from "lucide-react";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { Tables } from "@/integrations/supabase/types";

interface SortableLeadItemProps {
  lead: Tables<"leads">;
  onLeadClick: (id: string) => void;
}

export const SortableLeadItem = ({ lead, onLeadClick }: SortableLeadItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-background p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onLeadClick(lead.id)}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{lead.name}</span>
        <div className="flex items-center gap-2">
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
        {lead.platform} · {lead.industry}
      </div>
    </div>
  );
};