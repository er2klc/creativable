import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePhaseMutations } from "./usePhaseMutations";
import { useSettings } from "@/hooks/use-settings";

interface AddPhaseButtonProps {
  pipelineId: string | null;
}

export function AddPhaseButton({ pipelineId }: AddPhaseButtonProps) {
  const { settings } = useSettings();
  const { addPhase } = usePhaseMutations();

  const handleAddPhase = async () => {
    if (!pipelineId) return;
    
    try {
      await addPhase.mutateAsync({
        name: settings?.language === "en" ? "New Phase" : "Neue Phase",
        pipelineId
      });
    } catch (error) {
      console.error("Error adding phase:", error);
    }
  };

  return (
    <div className="h-full min-w-[190px] flex-1 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={handleAddPhase}
        className="h-12 w-12 rounded-full hover:bg-primary/10 hover:text-primary"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}