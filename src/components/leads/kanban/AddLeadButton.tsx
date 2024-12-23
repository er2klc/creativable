import { UserPlus } from "lucide-react";
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
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-muted-foreground hover:text-foreground bg-transparent"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Neuer Kontakt
        </Button>
      }
      defaultPhase={phase}
    />
  );
}