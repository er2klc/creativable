import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { TeamEventForm } from "./TeamEventForm";

interface NewTeamEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedDate: Date | null;
  teamId: string;
  eventToEdit?: any;
  onDisableInstance?: (date: Date) => void;
}

export const NewTeamEventDialog = ({
  open,
  onOpenChange,
  initialSelectedDate,
  teamId,
  eventToEdit,
  onDisableInstance,
}: NewTeamEventDialogProps) => {
  // Ensure initialSelectedDate is a valid Date object
  const selectedDate = initialSelectedDate ? new Date(initialSelectedDate) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {eventToEdit ? "Termin bearbeiten" : "Neuer Termin"}
          </DialogTitle>
        </DialogHeader>

        <TeamEventForm
          teamId={teamId}
          selectedDate={selectedDate}
          eventToEdit={eventToEdit}
          onClose={() => onOpenChange(false)}
          onDisableInstance={onDisableInstance}
        />
      </DialogContent>
    </Dialog>
  );
};