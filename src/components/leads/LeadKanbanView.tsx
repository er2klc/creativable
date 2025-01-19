import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { Tables } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { PhaseColumn } from "./kanban/PhaseColumn";
import { AddPhaseButton } from "./kanban/AddPhaseButton";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string | null) => void;
}

export const LeadKanbanView = ({ leads, selectedPipelineId, setSelectedPipelineId }: LeadKanbanViewProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const session = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [pipelineName, setPipelineName] = useState("");

  const { data: phases = [] } = useQuery({
    queryKey: ["pipeline-phases", selectedPipelineId],
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

  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, phaseId }: { leadId: string; phaseId: string }) => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      // Get the current lead to check its phase
      const { data: currentLead } = await supabase
        .from("leads")
        .select("phase_id")
        .eq("id", leadId)
        .single();

      const oldPhase = currentLead?.phase_id;

      // Create phase change note
      if (oldPhase !== phaseId) {
        const { error: noteError } = await supabase
          .from("notes")
          .insert({
            lead_id: leadId,
            user_id: session.user.id,
            content: `Phase von "${oldPhase}" zu "${phaseId}" geändert`,
            color: "#E9D5FF",
            metadata: {
              type: "phase_change",
              oldPhase,
              newPhase: phaseId
            }
          });

        if (noteError) {
          console.error("Error creating phase change note:", noteError);
          throw noteError;
        }
      }

      // Update the lead's phase
      const { data, error } = await supabase
        .from("leads")
        .update({
          phase_id: phaseId,
          last_action: settings?.language === "en" ? "Phase changed" : "Phase geändert",
          last_action_date: new Date().toISOString(),
        })
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
          ? "Phase updated successfully"
          : "Phase erfolgreich aktualisiert"
      );
    },
    onError: (error) => {
      console.error("Error updating phase:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating phase"
          : "Fehler beim Aktualisieren der Phase"
      );
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      const leadId = active.id as string;
      const newPhaseId = over.id as string;
      
      updateLeadMutation.mutate({ leadId, newPhaseId });
    }
  };

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex items-center justify-between mb-4 px-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              placeholder={settings?.language === "en" ? "Pipeline name" : "Pipeline-Name"}
              className="max-w-xs"
            />
            <Button 
              onClick={handleSaveClick}
              disabled={!pipelineName.trim()}
            >
              {settings?.language === "en" ? "Save Pipeline Name" : "Pipeline-Name speichern"}
            </Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              {settings?.language === "en" ? "Cancel" : "Abbrechen"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">
              {selectedPipeline?.name || (settings?.language === "en" ? "Select Pipeline" : "Pipeline auswählen")}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleEditClick}>
              {settings?.language === "en" ? "Edit" : "Bearbeiten"}
            </Button>
          </div>
        )}
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 p-4">
          <SortableContext items={phases.map(phase => phase.id)}>
            {phases.map((phase) => (
              <PhaseColumn
                key={phase.id}
                phase={phase}
                leads={leads.filter((lead) => lead.phase_id === phase.id)}
              />
            ))}
          </SortableContext>
          <AddPhaseButton pipelineId={selectedPipelineId} />
        </div>
      </DndContext>
    </div>
  );
};
