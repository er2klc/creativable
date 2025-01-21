import { Button } from "@/components/ui/button";
import { ChevronDown, Instagram, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { useState } from "react";
import { CreateInstagramContactDialog } from "../instagram/CreateInstagramContactDialog";

interface AddLeadButtonProps {
  phase: string;
  pipelineId: string;
}

export function AddLeadButton({ phase, pipelineId }: AddLeadButtonProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuItem onClick={() => setShowInstagramDialog(true)}>
            <Instagram className="h-4 w-4 mr-2" />
            <span className="font-[instagram-sans]">Instagram</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={() => setShowAddDialog(true)} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Kontakt hinzufügen ✨
      </Button>

      <AddLeadDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        defaultPhase={phase}
        pipelineId={pipelineId}
      />

      <CreateInstagramContactDialog
        open={showInstagramDialog}
        onOpenChange={setShowInstagramDialog}
        phaseId={phase}
        pipelineId={pipelineId}
      />
    </div>
  );
}