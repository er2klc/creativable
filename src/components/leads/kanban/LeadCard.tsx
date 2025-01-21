import { Draggable } from "@hello-pangea/dnd";
import { Tables } from "@/integrations/supabase/types";

interface LeadCardProps {
  lead: Tables<"leads">;
  index: number;
  onClick: () => void;
}

export const LeadCard = ({ lead, index, onClick }: LeadCardProps) => {
  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            {lead.avatar_url ? (
              <img
                src={lead.avatar_url}
                alt={lead.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {lead.name?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-medium">{lead.name}</h3>
              <p className="text-sm text-muted-foreground">{lead.platform}</p>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};