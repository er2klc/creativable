import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddLeadDialog } from "../AddLeadDialog";
import { useState } from "react";

interface AddLeadButtonProps {
  phase: string;
  variant?: "default" | "ghost";
  pipelineId?: string | null;
}

export function AddLeadButton({ phase, pipelineId, variant = "ghost" }: AddLeadButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="w-full text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent"
        onClick={() => setOpen(true)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Neuer Kontakt
      </Button>

      <AddLeadDialog
        open={open}
        onOpenChange={setOpen}
        defaultPhase={phase}
        pipelineId={pipelineId}
      />
    </>
  );
}