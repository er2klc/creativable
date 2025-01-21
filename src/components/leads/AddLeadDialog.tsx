import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AddLeadFormFields } from "./AddLeadFormFields";
import { Instagram, Linkedin, UserPlus } from "lucide-react";

interface AddLeadDialogProps {
  trigger?: React.ReactNode;
  defaultPhase?: string;
  pipelineId?: string | null;
}

export function AddLeadDialog({ trigger, defaultPhase, pipelineId }: AddLeadDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-4 w-4 mr-2" />
              Instagram
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Linkedin className="h-4 w-4 mr-2" />
              LinkedIn
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <UserPlus className="h-4 w-4 mr-2" />
              Manuell
            </Button>
          </div>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kontakt hinzufügen</DialogTitle>
        </DialogHeader>
        <AddLeadFormFields defaultPhase={defaultPhase} pipelineId={pipelineId} />
      </DialogContent>
    </Dialog>
  );
}