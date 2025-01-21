import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AddLeadButtonProps {
  phase: string;
  pipelineId: string;
}

export const AddLeadButton = ({ phase, pipelineId }: AddLeadButtonProps) => {
  const handleAddLead = async () => {
    try {
      // Logic to add a new lead
      const { data, error } = await supabase
        .from("leads")
        .insert({
          phase_id: phase,
          pipeline_id: pipelineId,
          // Add other necessary fields here
        });

      if (error) throw error;

      toast.success("Lead erfolgreich hinzugefügt");
    } catch (error) {
      console.error("Error adding lead:", error);
      toast.error("Fehler beim Hinzufügen des Leads");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full"
      onClick={handleAddLead}
    >
      <Plus className="h-4 w-4 mr-2" />
      Kontakt hinzufügen
    </Button>
  );
};
