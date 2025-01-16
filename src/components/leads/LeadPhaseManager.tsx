import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { SortablePhase } from "./SortablePhase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { useSession } from "@supabase/auth-helpers-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LeadPhaseManager = () => {
  const [newPhaseName, setNewPhaseName] = useState("");
  const [phaseToDelete, setPhaseToDelete] = useState<{ id: string; name: string } | null>(null);
  const [targetPhase, setTargetPhase] = useState<string>("");
  const { settings } = useSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const session = useSession();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: phases = [], isError } = useQuery({
    queryKey: ["lead-phases"],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const { data, error } = await supabase
        .from("lead_phases")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const updatePhaseOrder = useMutation({
    mutationFn: async (updatedPhases: typeof phases) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const updates = updatedPhases.map((phase, index) => ({
        id: phase.id,
        name: phase.name,
        order_index: index,
        user_id: session.user.id,
      }));

      const { error } = await supabase
        .from("lead_phases")
        .upsert(updates, { onConflict: "id" });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
    },
  });

  const addPhase = useMutation({
    mutationFn: async (name: string) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase.from("lead_phases").insert({
        name,
        order_index: phases.length,
        user_id: session.user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
      setNewPhaseName("");
      toast({
        title: settings?.language === "en" ? "Phase added" : "Phase hinzugefügt",
        description: settings?.language === "en" 
          ? "The phase has been added successfully" 
          : "Die Phase wurde erfolgreich hinzugefügt",
      });
    },
  });

  const deletePhase = useMutation({
    mutationFn: async ({ phaseId, targetPhaseName }: { phaseId: string; targetPhaseName: string }) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      // First update all leads in the phase being deleted
      const { error: updateError } = await supabase
        .from("leads")
        .update({ phase: targetPhaseName })
        .eq("phase", phaseToDelete?.name)
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      // Then delete the phase
      const { error: deleteError } = await supabase
        .from("lead_phases")
        .delete()
        .eq("id", phaseId)
        .eq("user_id", session.user.id);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: settings?.language === "en" ? "Phase deleted" : "Phase gelöscht",
        description: settings?.language === "en"
          ? "The phase and its contacts have been moved successfully"
          : "Die Phase wurde gelöscht und die Kontakte wurden verschoben",
      });
      setPhaseToDelete(null);
      setTargetPhase("");
    },
  });

  const handleDeletePhase = async (phase: { id: string; name: string }) => {
    // Check if there are any leads in this phase
    const { data: leadsInPhase, error } = await supabase
      .from("leads")
      .select("id")
      .eq("phase", phase.name)
      .eq("user_id", session?.user?.id);

    if (error) {
      console.error("Error checking leads:", error);
      return;
    }

    if (leadsInPhase && leadsInPhase.length > 0) {
      // If there are leads, show the dialog
      setPhaseToDelete(phase);
    } else {
      // If no leads, delete directly
      deletePhase.mutate({ phaseId: phase.id, targetPhaseName: "" });
    }
  };

  const handleConfirmDelete = () => {
    if (!phaseToDelete || !targetPhase) return;
    deletePhase.mutate({ 
      phaseId: phaseToDelete.id, 
      targetPhaseName: targetPhase 
    });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = phases.findIndex((phase) => phase.id === active.id);
      const newIndex = phases.findIndex((phase) => phase.id === over.id);

      const newPhases = arrayMove(phases, oldIndex, newIndex);
      updatePhaseOrder.mutate(newPhases);
    }
  };

  if (isError) {
    return (
      <div className="text-destructive">
        {settings?.language === "en" 
          ? "Error loading phases. Please try again later."
          : "Fehler beim Laden der Phasen. Bitte versuchen Sie es später erneut."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder={settings?.language === "en" ? "New phase name" : "Name der neuen Phase"}
          value={newPhaseName}
          onChange={(e) => setNewPhaseName(e.target.value)}
        />
        <Button
          onClick={() => addPhase.mutate(newPhaseName)}
          disabled={!newPhaseName.trim() || !session?.user?.id}
        >
          <Plus className="h-4 w-4 mr-2" />
          {settings?.language === "en" ? "Add Phase" : "Phase hinzufügen"}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={phases.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {phases.map((phase) => (
              <SortablePhase
                key={phase.id}
                phase={phase}
                onDelete={() => handleDeletePhase(phase)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={!!phaseToDelete} onOpenChange={() => setPhaseToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {settings?.language === "en" 
                ? "Move Contacts Before Deleting" 
                : "Kontakte verschieben vor dem Löschen"}
            </DialogTitle>
            <DialogDescription>
              {settings?.language === "en"
                ? "Please select where to move the contacts from this phase before deleting it."
                : "Bitte wählen Sie aus, wohin die Kontakte dieser Phase verschoben werden sollen."}
            </DialogDescription>
          </DialogHeader>
          <Select value={targetPhase} onValueChange={setTargetPhase}>
            <SelectTrigger>
              <SelectValue placeholder={
                settings?.language === "en" 
                  ? "Select target phase" 
                  : "Zielphase auswählen"
              } />
            </SelectTrigger>
            <SelectContent>
              {phases
                .filter(p => p.id !== phaseToDelete?.id)
                .map(phase => (
                  <SelectItem key={phase.id} value={phase.name}>
                    {phase.name}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPhaseToDelete(null)}
            >
              {settings?.language === "en" ? "Cancel" : "Abbrechen"}
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={!targetPhase}
            >
              {settings?.language === "en" ? "Move and Delete" : "Verschieben und Löschen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};