import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Star, Send } from "lucide-react";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
}

export const LeadKanbanView = ({ leads, onLeadClick }: LeadKanbanViewProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {["initial_contact", "follow_up", "closed"].map((phase) => (
        <div key={phase} className="bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium mb-4">
            {phase === "initial_contact"
              ? "Erstkontakt"
              : phase === "follow_up"
              ? "Follow-up"
              : "Abschluss"}
          </h3>
          <div className="space-y-2">
            {leads
              .filter((lead) => lead.phase === phase)
              .map((lead) => (
                <div
                  key={lead.id}
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
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};