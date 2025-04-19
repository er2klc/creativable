
import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadAvatar } from "./LeadAvatar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";

interface Phase {
  id: string;
  name: string;
  order_index: number;
  leads: any[];
}

export const LeadKanbanView = () => {
  const queryClient = useQueryClient();
  const [phases, setPhases] = useState<Phase[]>([]);

  // Fetch phases
  const { data: phasesData } = useQuery({
    queryKey: ["phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("phases")
        .select("*")
        .order("order_index");

      if (error) throw error;
      return data;
    }
  });

  // Add phase mutation
  const addPhaseMutation = useMutation({
    mutationFn: async ({ name }: { name: string; }) => {
      const { data, error } = await supabase
        .from("phases")
        .insert({
          name,
          pipeline_id: "default",
          order_index: phases.length
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phases"] });
      toast.success("Phase added successfully");
    }
  });

  // Update phase order mutation
  const updatePhaseOrderMutation = useMutation({
    mutationFn: async (updatedPhases: Phase[]) => {
      const updates = updatedPhases.map((phase, index) => ({
        id: phase.id,
        order_index: index
      }));

      const { error } = await supabase
        .from("phases")
        .upsert(updates);

      if (error) throw error;
      return null;
    }
  });

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(phases);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPhases(items);
    updatePhaseOrderMutation.mutate(items);
  };

  const handleAddPhase = () => {
    const name = prompt("Enter phase name");
    if (name) {
      addPhaseMutation.mutate({ name });
    }
  };

  useEffect(() => {
    if (phasesData) {
      setPhases(phasesData);
    }
  }, [phasesData]);

  return (
    <div className="p-4">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          <Droppable droppableId="phases" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-4"
              >
                {phases.map((phase, index) => (
                  <Draggable
                    key={phase.id}
                    draggableId={phase.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-white p-4 rounded-lg shadow min-w-[300px]"
                      >
                        <h3 className="font-semibold mb-4">{phase.name}</h3>
                        {phase.leads?.map((lead) => (
                          <div
                            key={lead.id}
                            className="bg-gray-50 p-3 rounded mb-2"
                          >
                            <div className="flex items-center gap-2">
                              <LeadAvatar lead={lead} />
                              <span>{lead.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          <Button
            onClick={handleAddPhase}
            variant="outline"
            className="flex items-center gap-2 min-w-[300px] h-auto"
          >
            <PlusCircle className="h-5 w-5" />
            Add Phase
          </Button>
        </div>
      </DragDropContext>
    </div>
  );
};
