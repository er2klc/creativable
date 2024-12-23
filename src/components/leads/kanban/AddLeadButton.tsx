import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddLeadDialog } from "../AddLeadDialog";

interface AddLeadButtonProps {
  phase: string;
  variant?: "default" | "ghost";
}

export function AddLeadButton({ phase, variant = "ghost" }: AddLeadButtonProps) {
  return (
    <AddLeadDialog
      trigger={
        <Button variant={variant} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Neuer Kontakt
        </Button>
      }
      defaultPhase={phase}
    />
  );
}