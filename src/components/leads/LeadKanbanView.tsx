
import { useEffect, useState } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadAvatar } from "./LeadAvatar";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { SortablePhaseItem } from "./SortablePhaseItem";

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;
    
    setPhases((phases) => {
      const oldIndex = phases.findIndex((phase) => phase.id === active.id);
      const newIndex = phases.findIndex((phase) => phase.id === over.id);
      
      const newPhases = arrayMove(phases, oldIndex, newIndex);
      updatePhaseOrderMutation.mutate(newPhases);
      
      return newPhases;
    });
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
      <DndContext 
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          <SortableContext 
            items={phases.map(phase => phase.id)} 
            strategy={horizontalListSortingStrategy}
          >
            {phases.map((phase) => (
              <SortablePhaseItem key={phase.id} phase={phase} />
            ))}
          </SortableContext>
          
          <Button
            onClick={handleAddPhase}
            variant="outline"
            className="flex items-center gap-2 min-w-[300px] h-auto"
          >
            <PlusCircle className="h-5 w-5" />
            Add Phase
          </Button>
        </div>
      </DndContext>
    </div>
  );
};
