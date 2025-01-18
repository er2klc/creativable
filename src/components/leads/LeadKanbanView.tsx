import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PhaseColumn } from "./kanban/PhaseColumn";
import { useKanbanSubscription } from "./kanban/useKanbanSubscription";
import { usePhaseQuery } from "./kanban/usePhaseQuery";
import { usePhaseMutations } from "./kanban/usePhaseMutations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  selectedPipelineId: string | null;
}

export const LeadKanbanView = ({ leads, selectedPipelineId }: LeadKanbanViewProps) => {
  const { settings } = useSettings();
  const [editingPhase, setEditingPhase] = useState<Tables<"pipeline_phases"> | null>(null);
  const { data: phases = [] } = usePhaseQuery(selectedPipelineId);
  const { updateLeadPhase, addPhase, updatePhaseName, deletePhase } = usePhaseMutations();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Use the subscription hook
  useKanbanSubscription();

  const updateLeadPhaseMutation = useMutation({
    mutationFn: async ({ leadId, newPhase }: { leadId: string; newPhase: string }) => {
      const lead = leads.find(l => l.id === leadId);
      if (lead?.phase_id === newPhase) {
        return null; // Skip update if phase hasn't changed
      }

      const { error } = await supabase
        .from("leads")
        .update({ 
          phase_id: newPhase,
          last_action: settings?.language === "en" ? "Phase changed" : "Phase geändert",
          last_action_date: new Date().toISOString(),
        })
        .eq("id", leadId);

      if (error) throw error;
    },
    onSuccess: (data) => {
      if (data !== null) { // Only show toast if update actually happened
        queryClient.invalidateQueries({ queryKey: ["leads"] });
        toast.success(
          settings?.language === "en" 
            ? "Contact phase updated successfully" 
            : "Kontaktphase erfolgreich aktualisiert"
        );
      }
    },
    onError: (error) => {
      console.error("Error updating lead phase:", error);
      toast.error(
        settings?.language === "en"
          ? "Failed to update contact phase"
          : "Fehler beim Aktualisieren der Kontaktphase"
      );
    },
  });

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;

    const leadId = active.id as string;
    const newPhase = over.id as string;
    
    if (newPhase) {
      try {
        await updateLeadPhaseMutation.mutateAsync({ 
          leadId, 
          newPhase 
        });
      } catch (error) {
        console.error("Error updating lead phase:", error);
      }
    }
  };

  const handleLeadClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  const handleAddPhase = () => {
    if (!selectedPipelineId) {
      toast.error(settings?.language === "en" 
        ? "No pipeline selected" 
        : "Keine Pipeline ausgewählt");
      return;
    }
    const defaultName = settings?.language === "en" ? "New Phase" : "Neue Phase";
    addPhase.mutate({ name: defaultName, pipelineId: selectedPipelineId });
  };

  const MIN_PHASE_WIDTH = 280;
  const GAP = 16;
  const totalWidth = phases.length * MIN_PHASE_WIDTH + ((phases.length - 1) * GAP);

  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-[calc(100vh-13rem)] overflow-hidden relative">
        <div className="w-full h-full overflow-x-auto no-scrollbar">
          <div 
            className="flex gap-4 px-4 relative min-h-full" 
            style={{ 
              minWidth: `${totalWidth}px`,
              maxWidth: '100%'
            }}
          >
            {/* Shadow indicator for left scroll */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />

            {phases.map((phase) => (
              <div key={phase.id} className="flex-1 min-w-[280px] max-w-[300px]">
                <PhaseColumn
                  phase={phase}
                  leads={leads.filter((lead) => lead.phase_id === phase.id)}
                  onLeadClick={handleLeadClick}
                  onEditPhase={setEditingPhase}
                  onDeletePhase={() => deletePhase.mutate(phase.id)}
                />
              </div>
            ))}

            {/* Shadow indicator for right scroll */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>

      <Dialog open={!!editingPhase} onOpenChange={() => setEditingPhase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {settings?.language === "en" ? "Edit Phase" : "Phase bearbeiten"}
            </DialogTitle>
            <DialogDescription>
              {settings?.language === "en" 
                ? "Enter a new name for this phase"
                : "Geben Sie einen neuen Namen für diese Phase ein"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editingPhase?.name || ""}
              onChange={(e) =>
                setEditingPhase(prev =>
                  prev ? { ...prev, name: e.target.value } : null
                )
              }
              placeholder={settings?.language === "en" ? "Phase name" : "Phasenname"}
            />
            <Button
              onClick={() => {
                if (editingPhase) {
                  updatePhaseName.mutate({
                    id: editingPhase.id,
                    name: editingPhase.name,
                    oldName: editingPhase.name,
                  });
                  setEditingPhase(null);
                }
              }}
            >
              {settings?.language === "en" ? "Save" : "Speichern"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DndContext>
  );
};