import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId?: string | null;
}

export const AddLeadDialog = ({ open, onOpenChange }: AddLeadDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Lead Dialog Placeholder</DialogTitle>
        </DialogHeader>
        <p>This dialog is disabled in the current build.</p>
      </DialogContent>
    </Dialog>
  );
};