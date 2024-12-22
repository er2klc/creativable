import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
}

export const LeadKanbanView = ({ leads }: LeadKanbanViewProps) => {
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
                  className="bg-background p-4 rounded-lg shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{lead.name}</span>
                    <Button variant="ghost" size="icon" className="h-4 w-4">
                      <Star className="h-4 w-4" />
                    </Button>
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