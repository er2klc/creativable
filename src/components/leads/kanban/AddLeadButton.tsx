import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddLeadDialog } from "../AddLeadDialog";

interface AddLeadButtonProps {
  phase: string;
  variant?: "default" | "ghost";
  pipelineId?: string | null;
}

export function AddLeadButton({ phase, pipelineId, variant = "ghost" }: AddLeadButtonProps) {
  return (
    <AddLeadDialog
      trigger={
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Kontakt hinzufügen ✨
        </Button>
      }
      defaultPhase={phase}
      pipelineId={pipelineId}
    />
  );
}