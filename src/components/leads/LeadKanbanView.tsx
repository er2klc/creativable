import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Star, Send, Plus, Edit } from "lucide-react";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Tables } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SortableLeadItem = ({
  lead,
  onLeadClick,
}: {
  lead: Tables<"leads">;
  onLeadClick: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
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
  );
};

export const LeadKanbanView = ({ leads, onLeadClick }: LeadKanbanViewProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const [editingPhase, setEditingPhase] = useState<{ id: string; name: string } | null>(null);

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
        .update({ phase: newPhase })
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
      const { error } = await supabase.from("lead_phases").insert({
        name: settings?.language === "en" ? "New Phase" : "Neue Phase",
        order_index: phases.length,
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

  // Subscribe to real-time updates for leads
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
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

    return () => {
      supabase.removeChannel(channel);
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
          <div
            key={phase.name}
            id={phase.name}
            className="bg-muted/50 p-4 rounded-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{phase.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditingPhase(phase)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <SortableContext items={leads.map((l) => l.id)} strategy={rectSortingStrategy}>
              <div className="space-y-2">
                {leads
                  .filter((lead) => lead.phase === phase.name)
                  .map((lead) => (
                    <SortableLeadItem
                      key={lead.id}
                      lead={lead}
                      onLeadClick={onLeadClick}
                    />
                  ))}
              </div>
            </SortableContext>
          </div>
        ))}
        <div className="bg-muted/50 p-4 rounded-lg flex items-center justify-center">
          <Button
            variant="ghost"
            className="h-full w-full flex flex-col gap-2 items-center justify-center"
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
