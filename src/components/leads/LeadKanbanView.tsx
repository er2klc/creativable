import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useKanbanSubscription } from "./kanban/useKanbanSubscription";
import { usePhaseQuery } from "./kanban/usePhaseQuery";
import { usePhaseMutations } from "./kanban/usePhaseMutations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { DeletePhaseDialog } from "./phases/DeletePhaseDialog";
import { AddLeadDialog } from "./AddLeadDialog";
import { KanbanHeader } from "./kanban/KanbanHeader";
import { KanbanColumns } from "./kanban/KanbanColumns";
import { EmptyStateMessage } from "./kanban/EmptyStateMessage";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
}

export const LeadKanbanView = ({ 
  leads, 
  selectedPipelineId,
  setSelectedPipelineId 
}: LeadKanbanViewProps) => {
  const { settings } = useSettings();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPipelineName, setEditingPipelineName] = useState("");
  const [phaseToDelete, setPhaseToDelete] = useState<{ id: string; name: string } | null>(null);
  const [targetPhase, setTargetPhase] = useState<string>("");
  const [showAddLead, setShowAddLead] = useState(false);
  const { data: phases = [], isLoading } = usePhaseQuery(selectedPipelineId);
  const { updateLeadPhase, addPhase, updatePhaseName, deletePhase, updatePhaseOrder } = usePhaseMutations();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useKanbanSubscription();

  const updatePipelineName = useMutation({
    mutationFn: async (newName: string) => {
      if (!selectedPipelineId) return;

      const { error } = await supabase
        .from("pipelines")
        .update({ name: newName })
        .eq("id", selectedPipelineId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      toast.success(
        settings?.language === "en" 
          ? "Pipeline name updated successfully" 
          : "Pipeline-Name erfolgreich aktualisiert"
      );
    },
    onError: (error) => {
      console.error("Error updating pipeline name:", error);
      toast.error(
        settings?.language === "en"
          ? "Failed to update pipeline name"
          : "Fehler beim Aktualisieren des Pipeline-Namens"
      );
    },
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;

    const leadId = active.id as string;
    const newPhase = over.id as string;
    
    if (newPhase && !isEditMode) {
      try {
        await updateLeadPhase.mutateAsync({ 
          leadId, 
          phaseId: newPhase 
        });
      } catch (error) {
        console.error("Error updating lead phase:", error);
      }
    }
  };

  const handleLeadClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  const handleSaveChanges = async () => {
    if (editingPipelineName) {
      await updatePipelineName.mutateAsync(editingPipelineName);
    }
    setIsEditMode(false);
  };

  const handleDeletePhase = async () => {
    if (!phaseToDelete || !targetPhase) return;

    try {
      await deletePhase.mutateAsync({ 
        phaseId: phaseToDelete.id, 
        targetPhaseId: targetPhase 
      });
      setPhaseToDelete(null);
      setTargetPhase("");
    } catch (error) {
      console.error("Error deleting phase:", error);
    }
  };

  const handleMovePhase = async (phaseId: string, direction: 'left' | 'right') => {
    const currentIndex = phases.findIndex(p => p.id === phaseId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= phases.length) return;

    const updatedPhases = [...phases];
    const [movedPhase] = updatedPhases.splice(currentIndex, 1);
    updatedPhases.splice(newIndex, 0, movedPhase);

    const phasesWithNewOrder = updatedPhases.map((phase, index) => ({
      ...phase,
      order_index: index
    }));

    try {
      await updatePhaseOrder.mutateAsync(phasesWithNewOrder);
    } catch (error) {
      console.error("Error updating phase order:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between p-4 bg-background sticky top-0 z-20 border-b">
          <KanbanHeader
            isEditMode={isEditMode}
            editingPipelineName={editingPipelineName}
            onEditingPipelineNameChange={setEditingPipelineName}
            onSaveChanges={handleSaveChanges}
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddLead(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              {settings?.language === "en" ? "Add Contact" : "Kontakt hinzufügen"}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto no-scrollbar relative">
          <KanbanColumns
            phases={phases}
            leads={leads}
            isEditMode={isEditMode}
            selectedPipelineId={selectedPipelineId}
            onLeadClick={handleLeadClick}
            onDeletePhase={setPhaseToDelete}
            onUpdatePhaseName={(id, name) => updatePhaseName.mutate({ id, name })}
            onMovePhase={handleMovePhase}
          />
        </div>

        {leads.length === 0 && <EmptyStateMessage />}

        <DeletePhaseDialog
          phaseToDelete={phaseToDelete}
          targetPhase={targetPhase}
          setTargetPhase={setTargetPhase}
          onClose={() => setPhaseToDelete(null)}
          onConfirm={handleDeletePhase}
          phases={phases}
        />

        <AddLeadDialog
          open={showAddLead}
          onOpenChange={setShowAddLead}
          pipelineId={selectedPipelineId}
        />
      </div>
    </DndContext>
  );
};