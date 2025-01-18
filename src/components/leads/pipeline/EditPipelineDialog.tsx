import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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

interface EditPipelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  currentName: string;
  orderIndex: number;
}

export const EditPipelineDialog = ({
  open,
  onOpenChange,
  pipelineId,
  currentName,
  orderIndex,
}: EditPipelineDialogProps) => {
  const [pipelineName, setPipelineName] = useState(currentName);
  const [newOrderIndex, setNewOrderIndex] = useState(orderIndex);
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from("pipelines")
        .update({
          name: pipelineName,
          order_index: newOrderIndex,
        })
        .eq("id", pipelineId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["pipelines"] });
      toast.success(
        settings?.language === "en"
          ? "Pipeline updated successfully"
          : "Pipeline erfolgreich aktualisiert"
      );
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating pipeline:", error);
      toast.error(
        settings?.language === "en"
          ? "Failed to update pipeline"
          : "Fehler beim Aktualisieren der Pipeline"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {settings?.language === "en"
              ? "Edit Pipeline"
              : "Pipeline bearbeiten"}
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
          <div>
            <Input
              type="number"
              placeholder={
                settings?.language === "en"
                  ? "Order Index"
                  : "Reihenfolge"
              }
              value={newOrderIndex}
              onChange={(e) => setNewOrderIndex(parseInt(e.target.value))}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!pipelineName.trim()}
          >
            {settings?.language === "en" ? "Update Pipeline" : "Pipeline aktualisieren"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};