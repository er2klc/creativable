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

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
}

export const LeadKanbanView = ({ leads, onLeadClick }: LeadKanbanViewProps) => {
  const { settings } = useSettings();
  const [editingPhase, setEditingPhase] = useState<Tables<"lead_phases"> | null>(null);
  const { data: phases = [] } = usePhaseQuery();
  const { updateLeadPhase, addPhase, updatePhaseName } = usePhaseMutations();

  // Use the subscription hook
  useKanbanSubscription();

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !active) return;

    const leadId = active.id as string;
    const newPhase = phases.find(phase => phase.id === over.id);
    
    if (newPhase) {
      try {
        await updateLeadPhase.mutateAsync({ 
          leadId, 
          phaseName: newPhase.name 
        });
      } catch (error) {
        console.error("Error updating lead phase:", error);
      }
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {phases.map((phase) => (
          <PhaseColumn
            key={phase.id}
            phase={phase}
            leads={leads.filter(lead => lead.phase === phase.name)}
            onLeadClick={onLeadClick}
            onEditPhase={setEditingPhase}
          />
        ))}
        <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-center">
          <Button
            variant="ghost"
            className="h-full w-full flex flex-col gap-2 items-center justify-center hover:bg-primary/10"
            onClick={() => addPhase.mutate()}
          >
            <Plus className="h-6 w-6" />
            <span>{settings?.language === "en" ? "Add Phase" : "Phase hinzufügen"}</span>
          </Button>
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