import { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadCard } from "./kanban/LeadCard";
import { AddLeadButton } from "./kanban/AddLeadButton";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { LeadDetailView } from "./LeadDetailView";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
}

export function LeadKanbanView({ leads, selectedPipelineId, setSelectedPipelineId }: LeadKanbanViewProps) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const { data: phases = [] } = useQuery({
    queryKey: ["phases", selectedPipelineId],
    queryFn: async () => {
      if (!selectedPipelineId) return [];

      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", selectedPipelineId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!selectedPipelineId,
  });

  const updateLeadPhaseMutation = useMutation({
    mutationFn: async ({ leadId, phaseId }: { leadId: string; phaseId: string }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ phase_id: phaseId })
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(
        settings?.language === "en"
          ? "Contact updated successfully"
          : "Kontakt erfolgreich aktualisiert"
      );
    },
    onError: (error) => {
      console.error("Error updating lead phase:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating contact"
          : "Fehler beim Aktualisieren des Kontakts"
      );
    },
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const leadId = result.draggableId;
    const newPhaseId = result.destination.droppableId;

    if (result.source.droppableId !== newPhaseId) {
      updateLeadPhaseMutation.mutate({ leadId, phaseId: newPhaseId });
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {phases.map((phase) => {
            const phaseLeads = leads.filter((lead) => lead.phase_id === phase.id);

            return (
              <div key={phase.id} className="w-[280px] shrink-0">
                <div className="mb-4">
                  <AddLeadButton phase={phase.id} pipelineId={selectedPipelineId} />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-4">
                    {phase.name} ({phaseLeads.length})
                  </h3>
                  <Droppable droppableId={phase.id}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-2"
                      >
                        {phaseLeads.map((lead, index) => (
                          <LeadCard
                            key={lead.id}
                            lead={lead}
                            index={index}
                            onClick={() => setSelectedLeadId(lead.id)}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <LeadDetailView
        leadId={selectedLeadId}
        onClose={() => setSelectedLeadId(null)}
      />
    </>
  );
}