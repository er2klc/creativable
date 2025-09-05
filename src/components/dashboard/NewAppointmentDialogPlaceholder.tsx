import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedDate?: Date;
}

export const NewAppointmentDialog = ({ open, onOpenChange }: NewAppointmentDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Appointment Dialog Placeholder</DialogTitle>
        </DialogHeader>
        <p>This dialog is disabled in the current build.</p>
      </DialogContent>
    </Dialog>
  );
};