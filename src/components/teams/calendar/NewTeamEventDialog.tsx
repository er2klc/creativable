import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { TeamEventForm } from "./TeamEventForm";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  const selectedDate = initialSelectedDate ? new Date(initialSelectedDate) : null;

  const deleteEvent = useMutation({
    mutationFn: async () => {
      if (!eventToEdit?.id) return;
      
      const { error } = await supabase
        .from("team_calendar_events")
        .delete()
        .eq('id', eventToEdit.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-events"] });
      toast.success("Termin gelöscht");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Der Termin konnte nicht gelöscht werden");
      console.error("Error deleting event:", error);
    },
  });

  const dialogDescription = eventToEdit 
    ? "Bearbeiten Sie die Details des ausgewählten Termins."
    : "Erstellen Sie einen neuen Termin für Ihr Team.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="event-dialog-description">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {eventToEdit ? "Termin bearbeiten" : "Neuer Termin"}
            </DialogTitle>
            {eventToEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteEvent.mutate()}
                disabled={deleteEvent.isPending}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <DialogDescription id="event-dialog-description">
            {dialogDescription}
          </DialogDescription>
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