import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreateLinkedInContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId?: string | null;
}

export const CreateLinkedInContactDialog = ({ open, onOpenChange }: CreateLinkedInContactDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create LinkedIn Contact Dialog Placeholder</DialogTitle>
        </DialogHeader>
        <p>This dialog is disabled in the current build.</p>
      </DialogContent>
    </Dialog>
  );
};