import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
}

export const LeadKanbanView = ({ leads, onLeadClick }: LeadKanbanViewProps) => {
  const { settings } = useSettings();
  const [editingPhase, setEditingPhase] = useState<Tables<"pipeline_phases"> | null>(null);
  const { data: phases = [] } = usePhaseQuery();
  const { updateLeadPhase, addPhase, updatePhaseName } = usePhaseMutations();
  const queryClient = useQueryClient();

  // Use the subscription hook
  useKanbanSubscription();

  const updateLeadPhaseMutation = useMutation({
    mutationFn: async ({ leadId, newPhase }: { leadId: string; newPhase: string }) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(
        settings?.language === "en" 
          ? "Contact phase updated successfully" 
          : "Kontaktphase erfolgreich aktualisiert"
      );
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
                  onLeadClick={onLeadClick}
                  onEditPhase={setEditingPhase}
                />
              </div>
            ))}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 mt-4 flex-none"
              onClick={() => addPhase.mutate()}
            >
              <Plus className="h-4 w-4" />
            </Button>

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
