import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
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
import { useSession } from "@supabase/auth-helpers-react";

interface LeadKanbanViewProps {
  leads: Tables<"leads">[];
  onLeadClick: (id: string) => void;
}

export const LeadKanbanView = ({ leads, onLeadClick }: LeadKanbanViewProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const session = useSession();
  const [editingPhase, setEditingPhase] = useState<Tables<"lead_phases"> | null>(null);

  const { data: phases = [] } = useQuery({
    queryKey: ["lead-phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_phases")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  const updateLeadPhase = useMutation({
    mutationFn: async ({ leadId, newPhase }: { leadId: string; newPhase: string }) => {
      const { error } = await supabase
        .from("leads")
        .update({ 
          phase: newPhase,
          last_action: "Phase geändert",
          last_action_date: new Date().toISOString(),
        })
        .eq("id", leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        description: settings?.language === "en" 
          ? "The phase has been successfully updated."
          : "Die Phase wurde erfolgreich aktualisiert.",
      });
    },
  });

  const addPhase = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("lead_phases")
        .insert({
          name: settings?.language === "en" ? "New Phase" : "Neue Phase",
          order_index: phases.length,
          user_id: session?.user?.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
      toast({
        title: settings?.language === "en" ? "Phase added" : "Phase hinzugefügt",
        description: settings?.language === "en"
          ? "New phase has been added successfully"
          : "Neue Phase wurde erfolgreich hinzugefügt",
      });
    },
  });

  const updatePhaseName = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("lead_phases")
        .update({ name })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
      setEditingPhase(null);
      toast({
        title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        description: settings?.language === "en"
          ? "Phase name has been updated successfully"
          : "Phasenname wurde erfolgreich aktualisiert",
      });
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const leadsChannel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["leads"] });
        }
      )
      .subscribe();

    const phasesChannel = supabase
      .channel('phases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_phases'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(phasesChannel);
    };
  }, [queryClient]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const leadId = active.id as string;
      const newPhase = over.id as string;
      
      updateLeadPhase.mutate({ leadId, newPhase });
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
                  });
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