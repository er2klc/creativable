import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, Plus, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { LeadAvatar } from "./LeadAvatar";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  selectedPipelineId: string | null;
  setSelectedPipelineId: (id: string) => void;
  isEditMode: boolean;
}

interface PhaseProps {
  id: string;
  name: string;
  leads: Tables<"leads">[];
}

const LeadCard = ({ lead }: { lead: Tables<"leads"> }) => {
  return (
    <Draggable draggableId={lead.id} index={0}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {lead.name}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
              <CardDescription>{lead.industry}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center">
              <LeadAvatar lead={lead} />
              {lead.company_name}
            </CardContent>
            <CardFooter className="text-xs">Last action: {lead.last_action}</CardFooter>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

const PhaseColumn = ({ phase, leads, isEditMode }: { phase: any; leads: Tables<"leads">[]; isEditMode: boolean }) => {
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [phaseName, setPhaseName] = useState(phase.name);

  const updatePhaseMutation = useMutation(
    async ({ id, name }: { id: string; name: string }) => {
      const { data, error } = await supabase
        .from("pipeline_phases")
        .update({ name })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating phase:", error);
        throw error;
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["pipelines"] });
        toast({
          title: settings?.language === "en" ? "Phase updated!" : "Phase aktualisiert!",
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: settings?.language === "en" ? "Uh oh! Something went wrong." : "Oh oh! Da ist etwas schief gelaufen.",
          description: error.message,
        });
      },
    }
  );

  const handlePhaseNameUpdate = ({ id, name }: { id: string; name: string }) => {
    updatePhaseMutation.mutate({ id, name });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {isEditMode && isEditing ? (
          <Input
            value={phaseName}
            onChange={(e) => setPhaseName(e.target.value)}
            onBlur={() => {
              handlePhaseNameUpdate({ id: phase.id, name: phaseName });
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handlePhaseNameUpdate({ id: phase.id, name: phaseName });
                setIsEditing(false);
              }
            }}
            className="text-lg font-semibold"
          />
        ) : (
          <CardTitle className="text-lg font-semibold">{phase.name}</CardTitle>
        )}
        <div>
          {isEditMode ? (
            <>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                </Button>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">{leads.length}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pl-2 pr-2">
        <Droppable droppableId={phase.id}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {leads.map((lead, index) => (
                <Draggable key={lead.id} draggableId={lead.id} index={index}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <LeadCard lead={lead} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

export function LeadKanbanView({
  leads,
  selectedPipelineId,
  setSelectedPipelineId,
  isEditMode,
}: LeadKanbanViewProps) {
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [phases, setPhases] = useState<PhaseProps[]>([]);
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");

  const { data: pipeline, refetch } = useQuery(
    ["pipeline", selectedPipelineId],
    async () => {
      if (!selectedPipelineId) return null;

      const { data, error } = await supabase
        .from("pipelines")
        .select(`*, pipeline_phases(*)`)
        .eq("id", selectedPipelineId)
        .single();

      if (error) {
        console.error("Error fetching pipeline:", error);
        throw error;
      }

      return data;
    },
    {
      enabled: !!selectedPipelineId,
    }
  );

  useEffect(() => {
    if (pipeline?.pipeline_phases) {
      const sortedPhases = pipeline.pipeline_phases.sort(
        (a: any, b: any) => a.order_index - b.order_index
      );

      setPhases(
        sortedPhases.map((phase: any) => ({
          id: phase.id,
          name: phase.name,
          leads: leads.filter((lead) => lead.phase_id === phase.id),
        }))
      );
    }
  }, [pipeline, leads]);

  const updatePhaseOrderMutation = useMutation(
    async (updatedPhases: any[]) => {
      const updates = updatedPhases.map((phase, index) => ({
        id: phase.id,
        order_index: index,
      }));

      const { data, error } = await supabase
        .from("pipeline_phases")
        .upsert(updates);

      if (error) {
        console.error("Error updating phase order:", error);
        throw error;
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["pipelines"] });
        toast({
          title: settings?.language === "en" ? "Phase order updated!" : "Phasenreihenfolge aktualisiert!",
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: settings?.language === "en" ? "Uh oh! Something went wrong." : "Oh oh! Da ist etwas schief gelaufen.",
          description: error.message,
        });
      },
    }
  );

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const startPhaseId = source.droppableId;
    const endPhaseId = destination.droppableId;

    if (startPhaseId === endPhaseId) {
      return;
    }

    // Optimistically update the UI
    const newPhases = phases.map((phase) => {
      if (phase.id === startPhaseId) {
        return {
          ...phase,
          leads: phase.leads.filter((lead) => lead.id !== draggableId),
        };
      }
      if (phase.id === endPhaseId) {
        return {
          ...phase,
          leads: [
            ...phase.leads,
            leads.find((lead) => lead.id === draggableId),
          ],
        };
      }
      return phase;
    });

    setPhases(newPhases);

    // Update the lead's phase_id in the database
    const { error } = await supabase
      .from("leads")
      .update({ phase_id: endPhaseId })
      .eq("id", draggableId);

    if (error) {
      console.error("Error updating lead's phase:", error);
      toast({
        variant: "destructive",
        title: settings?.language === "en" ? "Uh oh! Something went wrong." : "Oh oh! Da ist etwas schief gelaufen.",
        description: error.message,
      });
      // Revert the UI update
      setPhases(phases);
    } else {
      // Invalidate queries to update the cache
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  };

  const handlePhaseOrderChange = async () => {
    const updatedPhases = phases.map((phase, index) => ({
      ...phase,
      order_index: index,
    }));

    setPhases(updatedPhases);
    await updatePhaseOrderMutation.mutateAsync(updatedPhases);
  };

  const createPhaseMutation = useMutation(
    async (name: string) => {
      const { data, error } = await supabase
        .from("pipeline_phases")
        .insert([{ name, pipeline_id: selectedPipelineId }])
        .select()
        .single();

      if (error) {
        console.error("Error creating phase:", error);
        throw error;
      }

      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["pipelines"] });
        refetch();
        toast({
          title: settings?.language === "en" ? "Phase created!" : "Phase erstellt!",
        });
      },
      onError: (error: any) => {
        toast({
          variant: "destructive",
          title: settings?.language === "en" ? "Uh oh! Something went wrong." : "Oh oh! Da ist etwas schief gelaufen.",
          description: error.message,
        });
      },
    }
  );

  const handleCreatePhase = async () => {
    if (!newPhaseName.trim()) return;
    await createPhaseMutation.mutateAsync(newPhaseName);
    setNewPhaseName("");
    setIsAddingPhase(false);
  };

  return (
    <div className="overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 pl-4 pr-4">
          {phases.map((phase) => (
            <PhaseColumn
              key={phase.id}
              phase={phase}
              leads={phase.leads}
              isEditMode={isEditMode}
            />
          ))}
          {isEditMode && (
            <Card className="w-64">
              <CardContent className="flex items-center justify-center">
                {isAddingPhase ? (
                  <div className="flex flex-col space-y-2">
                    <Input
                      type="text"
                      placeholder={settings?.language === "en" ? "Phase name" : "Phasenname"}
                      value={newPhaseName}
                      onChange={(e) => setNewPhaseName(e.target.value)}
                    />
                    <div className="flex justify-between">
                      <Button size="sm" onClick={handleCreatePhase}>
                        {settings?.language === "en" ? "Create" : "Erstellen"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAddingPhase(false)}
                      >
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
                    {settings?.language === "en" ? "Add Phase" : "Phase hinzufügen"}
                    <Plus className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}
