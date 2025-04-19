
import { useState, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Plus } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/components/ui/use-toast";
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

export function LeadKanbanView({
  leads,
  selectedPipelineId,
  setSelectedPipelineId,
  isEditMode,
}: LeadKanbanViewProps) {
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [phases, setPhases] = useState<any[]>([]);
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [newPhaseName, setNewPhaseName] = useState("");

  // Fetch pipeline phases
  const { data: pipeline, refetch } = useQuery({
    queryKey: ["pipeline", selectedPipelineId],
    queryFn: async () => {
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
    enabled: !!selectedPipelineId,
  });

  // Create phase mutation
  const createPhaseMutation = useMutation({
    mutationFn: async (name: string) => {
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
        title: settings?.language === "en" ? "Error creating phase" : "Fehler beim Erstellen der Phase",
        description: error.message,
      });
    },
  });

  // Update phase mutation
  const updatePhaseMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      toast({
        title: settings?.language === "en" ? "Phase updated!" : "Phase aktualisiert!",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: settings?.language === "en" ? "Error updating phase" : "Fehler beim Aktualisieren der Phase",
        description: error.message,
      });
    },
  });

  // Process pipeline data into phases
  useEffect(() => {
    if (pipeline?.pipeline_phases) {
      const sortedPhases = pipeline.pipeline_phases.sort(
        (a: any, b: any) => a.order_index - b.order_index
      );

      setPhases(
        sortedPhases.map((phase: any) => ({
          id: phase.id,
          name: phase.name,
          order_index: phase.order_index,
          leads: leads.filter((lead) => lead.phase_id === phase.id),
        }))
      );
    }
  }, [pipeline, leads]);

  // Handle create phase
  const handleCreatePhase = async () => {
    if (!newPhaseName.trim()) return;
    await createPhaseMutation.mutate(newPhaseName);
    setNewPhaseName("");
    setIsAddingPhase(false);
  };

  // Render loading state if no phases
  if (phases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {settings?.language === "en"
            ? "Loading pipeline phases..."
            : "Lade Pipeline-Phasen..."}
        </p>
      </div>
    );
  }

  // Simplified kanban view without drag-and-drop functionality
  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-4 pl-4 pr-4">
        {phases.map((phase) => (
          <Card key={phase.id} className="w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <div>{phase.name}</div>
                {isEditMode && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      const newName = prompt(
                        settings?.language === "en" 
                          ? "Enter new phase name" 
                          : "Geben Sie einen neuen Phasennamen ein", 
                        phase.name
                      );
                      if (newName && newName.trim() !== phase.name) {
                        updatePhaseMutation.mutate({ id: phase.id, name: newName });
                      }
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
              <div className="text-sm text-muted-foreground">{phase.leads.length} leads</div>
            </CardHeader>
            <CardContent className="pl-2 pr-2">
              {phase.leads.map((lead: Tables<"leads">) => (
                <Card key={lead.id} className="mb-4 p-3 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <LeadAvatar lead={lead} />
                    <div>
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-xs text-muted-foreground">{lead.company_name || lead.industry}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        ))}
        {isEditMode && (
          <Card className="w-64">
            <CardContent className="flex items-center justify-center pt-4">
              {isAddingPhase ? (
                <div className="flex flex-col space-y-2">
                  <Input
                    type="text"
                    placeholder={settings?.language === "en" ? "Phase name" : "Phasenname"}
                    value={newPhaseName}
                    onChange={(e) => setNewPhaseName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreatePhase();
                      }
                    }}
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
    </div>
  );
}
