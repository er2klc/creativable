import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface CreatePipelineDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreatePipelineDialog = ({ open, onOpenChange }: CreatePipelineDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pipelineName, setPipelineName] = useState("");
  const [phases, setPhases] = useState<{ name: string }[]>([{ name: "" }]);
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const handleAddPhase = () => {
    setPhases([...phases, { name: "" }]);
  };

  const handleRemovePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const handlePhaseNameChange = (index: number, value: string) => {
    const newPhases = [...phases];
    newPhases[index].name = value;
    setPhases(newPhases);
  };

  const handleSubmit = async () => {
    try {
      // Insert pipeline
      const { data: pipeline, error: pipelineError } = await supabase
        .from("pipelines")
        .insert({
          name: pipelineName,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (pipelineError) throw pipelineError;

      // Insert phases
      const { error: phasesError } = await supabase.from("pipeline_phases").insert(
        phases
          .filter((phase) => phase.name.trim())
          .map((phase, index) => ({
            pipeline_id: pipeline.id,
            name: phase.name,
            order_index: index,
          }))
      );

      if (phasesError) throw phasesError;

      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      toast.success(
        settings?.language === "en"
          ? "Pipeline created successfully"
          : "Pipeline erfolgreich erstellt"
      );
      setIsOpen(false);
      onOpenChange?.(false);
      setPipelineName("");
      setPhases([{ name: "" }]);
    } catch (error) {
      console.error("Error creating pipeline:", error);
      toast.error(
        settings?.language === "en"
          ? "Failed to create pipeline"
          : "Fehler beim Erstellen der Pipeline"
      );
    }
  };

  return (
    <Dialog open={open ?? isOpen} onOpenChange={onOpenChange ?? setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {settings?.language === "en"
              ? "Create New Pipeline"
              : "Neue Pipeline erstellen"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Input
              placeholder={
                settings?.language === "en"
                  ? "Pipeline Name"
                  : "Name der Pipeline"
              }
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {settings?.language === "en" ? "Phases" : "Phasen"}
            </h3>
            {phases.map((phase, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={
                    settings?.language === "en"
                      ? `Phase ${index + 1}`
                      : `Phase ${index + 1}`
                  }
                  value={phase.name}
                  onChange={(e) => handlePhaseNameChange(index, e.target.value)}
                />
                {phases.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePhase(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddPhase}
            >
              <Plus className="h-4 w-4 mr-2" />
              {settings?.language === "en" ? "Add Phase" : "Phase hinzufügen"}
            </Button>
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!pipelineName.trim() || !phases.some((p) => p.name.trim())}
          >
            {settings?.language === "en" ? "Create Pipeline" : "Pipeline erstellen"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};