import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Star, Send, Plus } from "lucide-react";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/hooks/use-settings";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
}

export const LeadKanbanView = ({ leads, onLeadClick }: LeadKanbanViewProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const [phases, setPhases] = useState<string[]>(["initial_contact", "follow_up", "closing"]);
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newPhase = destination.droppableId;

    try {
      const { error } = await supabase
        .from("leads")
        .update({ phase: newPhase })
        .eq("id", draggableId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["leads"] });
      
      toast({
        title: settings?.language === "en" ? "Contact updated" : "Kontakt aktualisiert",
        description: settings?.language === "en" 
          ? "The contact has been moved to a new phase"
          : "Der Kontakt wurde in eine neue Phase verschoben",
      });
    } catch (error) {
      console.error("Error updating lead phase:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to update contact phase"
          : "Fehler beim Aktualisieren der Kontaktphase",
        variant: "destructive",
      });
    }
  };

  const handleAddPhase = async () => {
    if (!newPhaseName.trim()) return;
    
    setPhases([...phases, newPhaseName.toLowerCase().replace(/\s+/g, '_')]);
    setNewPhaseName("");
    setIsAddingPhase(false);
  };

  const getPhaseTitle = (phase: string) => {
    const translations: Record<string, Record<string, string>> = {
      de: {
        initial_contact: "Erstkontakt",
        follow_up: "Follow-up",
        closing: "Abschluss",
      },
      en: {
        initial_contact: "Initial Contact",
        follow_up: "Follow-up",
        closing: "Closing",
      },
    };
    
    return translations[settings?.language || "de"]?.[phase] || phase;
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-4 gap-4">
        {phases.map((phase) => (
          <Droppable key={phase} droppableId={phase}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="bg-muted/50 p-4 rounded-lg"
              >
                <h3 className="font-medium mb-4">{getPhaseTitle(phase)}</h3>
                <div className="space-y-2">
                  {leads
                    .filter((lead) => lead.phase === phase)
                    .map((lead, index) => (
                      <Draggable
                        key={lead.id}
                        draggableId={lead.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-background p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => onLeadClick(lead.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{lead.name}</span>
                              <div className="flex items-center gap-2">
                                <SendMessageDialog
                                  lead={lead}
                                  trigger={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Send className="h-4 w-4" />
                                    </Button>
                                  }
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-2">
                              {lead.platform} · {lead.industry}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
        <div className="bg-muted/50 p-4 rounded-lg">
          {isAddingPhase ? (
            <div className="space-y-2">
              <input
                type="text"
                value={newPhaseName}
                onChange={(e) => setNewPhaseName(e.target.value)}
                className="w-full p-2 rounded border"
                placeholder={settings?.language === "en" ? "Phase name" : "Phasenname"}
              />
              <div className="flex gap-2">
                <Button onClick={handleAddPhase}>
                  {settings?.language === "en" ? "Add" : "Hinzufügen"}
                </Button>
                <Button variant="outline" onClick={() => setIsAddingPhase(false)}>
                  {settings?.language === "en" ? "Cancel" : "Abbrechen"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsAddingPhase(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {settings?.language === "en" ? "Add Phase" : "Phase hinzufügen"}
            </Button>
          )}
        </div>
      </div>
    </DragDropContext>
  );
};