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

  const MIN_PHASE_WIDTH = 200; // Minimum width for each phase in pixels
  const totalWidth = phases.length * MIN_PHASE_WIDTH + ((phases.length - 1) * 16); // 16px for gap-4

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="w-full h-[calc(100vh-13rem)] overflow-hidden">
        <div className="w-full h-full overflow-x-auto">
          <div 
            className="flex gap-4 px-4 relative" 
            style={{ 
              minWidth: `${totalWidth}px`,
              width: '100%'
            }}
          >
            {phases.map((phase) => (
              <div 
                key={phase.id} 
                className="flex-1" 
                style={{ 
                  minWidth: `${MIN_PHASE_WIDTH}px`
                }}
              >
                <PhaseColumn
                  phase={phase}
                  leads={leads.filter(lead => lead.phase === phase.name)}
                  onLeadClick={onLeadClick}
                  onEditPhase={setEditingPhase}
                />
              </div>
            ))}
            <div 
              className="flex-none" 
              style={{ 
                width: '40px'
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mt-4"
                onClick={() => addPhase.mutate()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
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