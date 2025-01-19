import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PhaseColumn } from "./kanban/PhaseColumn";
import { useKanbanSubscription } from "./kanban/useKanbanSubscription";
import { usePhaseQuery } from "./kanban/usePhaseQuery";
import { usePhaseMutations } from "./kanban/usePhaseMutations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadFilters } from "./LeadFilters";
import { DeletePhaseDialog } from "./phases/DeletePhaseDialog";
import { AddLeadDialog } from "./AddLeadDialog";

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
  const { data: phases = [] } = usePhaseQuery(selectedPipelineId);
  const { updateLeadPhase, addPhase, updatePhaseName, deletePhase } = usePhaseMutations();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Use the subscription hook
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
    
    if (newPhase && !isEditMode) {  // Only allow lead dragging when not in edit mode
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

  const handleEditModeToggle = () => {
    const currentPipeline = phases[0]?.pipeline_id ? {
      name: phases[0]?.name || ""
    } : null;
    
    setIsEditMode(!isEditMode);
    setEditingPipelineName(currentPipeline?.name || "");
  };

  const handleDeletePhase = async () => {
    if (!phaseToDelete || !targetPhase) return;

    try {
      await deletePhase.mutateAsync(phaseToDelete.id);
      setPhaseToDelete(null);
      setTargetPhase("");
    } catch (error) {
      console.error("Error deleting phase:", error);
    }
  };

  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between p-4 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <LeadFilters
              selectedPipelineId={selectedPipelineId}
              setSelectedPipelineId={setSelectedPipelineId}
              onEditPipeline={handleEditModeToggle}
              isEditMode={isEditMode}
            />
            {isEditMode && (
              <Button onClick={handleSaveChanges} variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                {settings?.language === "en" ? "Save Changes" : "Änderungen speichern"}
              </Button>
            )}
          </div>
          <Button onClick={() => setShowAddLead(true)} className="shrink-0">
            Neuer Kontakt ✨
          </Button>
        </div>

        <div className="flex-1 overflow-x-auto no-scrollbar relative">
          <div 
            className="flex gap-4 px-4 h-full" 
            style={{ 
              minWidth: 'fit-content',
            }}
          >
            {/* Shadow indicator for left scroll */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />

            {phases.map((phase) => (
              <div key={phase.id} className="flex-1" style={{ minWidth: '190px', width: `${100 / phases.length}%` }}>
                <PhaseColumn
                  phase={phase}
                  leads={leads.filter((lead) => lead.phase_id === phase.id)}
                  onLeadClick={handleLeadClick}
                  isEditMode={isEditMode}
                  onDeletePhase={() => setPhaseToDelete(phase)}
                  onUpdatePhaseName={(newName) => updatePhaseName.mutate({ id: phase.id, name: newName })}
                  pipelineId={selectedPipelineId}
                />
              </div>
            ))}

            {/* Shadow indicator for right scroll */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>
        </div>

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