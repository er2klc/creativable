import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { KanbanBoard } from "@/components/ui/kanban/KanbanBoard";
import { KanbanColumn } from "@/components/ui/kanban/KanbanColumn";

// Wrapper function to handle type compatibility issues
const createUpdatePhaseMutation = (mutationFn: any) => {
  return (id: string, name: string) => {
    mutationFn({ id, name });
  };
};

export const LeadKanbanView = () => {
  const [phases, setPhases] = useState([
    { id: "lead", name: "Lead" },
    { id: "discovery", name: "Discovery" },
    { id: "solution", name: "Solution" },
    { id: "negotiation", name: "Negotiation" },
    { id: "won", name: "Won" },
  ]);
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");
      if (error) throw error;
      return data;
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const updatePhaseMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      if (!id) return;

      await supabase
        .from("leads")
        .update({ 
          phase_id: name,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead updated successfully");
    },
    onError: (error) => {
      console.error("Error updating lead phase:", error);
      toast.error("Failed to update lead phase");
    },
  });

  // Create wrapper function that transforms the parameters to match the expected format
  const handleUpdatePhase = createUpdatePhaseMutation(updatePhaseMutation.mutate);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over) {
      handleUpdatePhase(active.id, over.id);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <KanbanBoard>
        {phases.map((phase) => (
          <KanbanColumn key={phase.id} id={phase.id} title={phase.name}>
            {leads
              ?.filter((lead) => lead.phase_id === phase.id)
              .map((lead) => (
                <div key={lead.id} id={lead.id}>
                  {lead.name}
                </div>
              ))}
          </KanbanColumn>
        ))}
      </KanbanBoard>
    </DndContext>
  );
};
