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
import { Save, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadFilters } from "./LeadFilters";
import { DeletePhaseDialog } from "./phases/DeletePhaseDialog";
import { AddLeadDialog } from "./AddLeadDialog";
import { AddPhaseButton } from "./kanban/AddPhaseButton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { scanSocialProfile } from "@/utils/apify";

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
  const { updateLeadPhase, addPhase, updatePhaseName, deletePhase, updatePhaseOrder } = usePhaseMutations();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useKanbanSubscription();

  // Add mutation for updating pipeline name
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

    // Update order_index for all phases
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

  const handleCreateSocialContact = async (platform: string) => {
    const username = await prompt(`Bitte geben Sie den ${platform}-Benutzernamen ein:`);
    if (!username) return;

    try {
      const socialData = await scanSocialProfile(platform.toLowerCase(), username);
      if (!socialData) {
        toast.error("Fehler beim Abrufen der Profildaten");
        return;
      }

      // Get first phase of standard pipeline
      const firstPhase = phases[0];
      if (!firstPhase) {
        toast.error("Keine Phase gefunden");
        return;
      }

      const { error } = await supabase.from("leads").insert({
        name: socialData.name || username,
        platform: platform,
        social_media_username: username,
        pipeline_id: selectedPipelineId,
        phase_id: firstPhase.id,
        instagram_followers: socialData.followers,
        instagram_following: socialData.following,
        instagram_posts: socialData.posts,
        social_media_bio: socialData.bio,
        instagram_profile_image_url: socialData.profileImageUrl,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        industry: "Not Specified" // Added missing required field
      });

      if (error) throw error;

      toast.success("Kontakt erfolgreich erstellt");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Fehler beim Erstellen des Kontakts");
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
              <>
                <Input
                  value={editingPipelineName}
                  onChange={(e) => setEditingPipelineName(e.target.value)}
                  placeholder={settings?.language === "en" ? "Pipeline Name" : "Pipeline-Name"}
                  className="w-[200px]"
                />
                <Button onClick={handleSaveChanges} variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {settings?.language === "en" ? "Save Pipeline Name" : "Pipeline-Name speichern"}
                </Button>
              </>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="shrink-0">
                Neuer Kontakt <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem onClick={() => setShowAddLead(true)}>
                Manuell erstellen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateSocialContact("Instagram")}>
                Von Instagram
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateSocialContact("LinkedIn")}>
                Von LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateSocialContact("Facebook")}>
                Von Facebook
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCreateSocialContact("TikTok")}>
                Von TikTok
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

            {phases.map((phase, index) => (
              <div key={phase.id} className="flex-1" style={{ minWidth: '190px', width: `${100 / phases.length}%` }}>
                <PhaseColumn
                  phase={phase}
                  leads={leads.filter((lead) => lead.phase_id === phase.id)}
                  onLeadClick={handleLeadClick}
                  isEditMode={isEditMode}
                  onDeletePhase={() => setPhaseToDelete(phase)}
                  onUpdatePhaseName={(newName) => updatePhaseName.mutate({ id: phase.id, name: newName })}
                  pipelineId={selectedPipelineId}
                  isFirst={index === 0}
                  isLast={index === phases.length - 1}
                  onMovePhase={
                    isEditMode 
                      ? (direction) => handleMovePhase(phase.id, direction)
                      : undefined
                  }
                />
              </div>
            ))}

            {isEditMode && (
              <AddPhaseButton pipelineId={selectedPipelineId} />
            )}

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
