import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Star, Send } from "lucide-react";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { useToast } from "@/hooks/use-toast";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
}

export const LeadKanbanView = ({ leads, onLeadClick }: LeadKanbanViewProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: phases = [] } = useQuery({
    queryKey: ["lead-phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_phases")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const updateLeadPhase = useMutation({
    mutationFn: async ({ leadId, newPhase }: { leadId: string; newPhase: string }) => {
      const { error } = await supabase
        .from("leads")
        .update({ phase: newPhase })
        .eq("id", leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: "Phase aktualisiert",
        description: "Die Phase wurde erfolgreich aktualisiert.",
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const leadId = active.id as string;
      const newPhase = over.id as string;
      
      updateLeadPhase.mutate({ leadId, newPhase });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {phases.map((phase) => (
          <div key={phase.name} className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium mb-4">{phase.name}</h3>
            <SortableContext items={leads.map(l => l.id)} strategy={rectSortingStrategy}>
              <div className="space-y-2">
                {leads
                  .filter((lead) => lead.phase === phase.name)
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
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
};