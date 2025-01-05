import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { TeamEventForm } from "./TeamEventForm";

interface NewTeamEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  teamId: string;
  eventToEdit?: {
    id: string;
    title: string;
    description?: string;
    start_time: string;
    end_time?: string;
    color: string;
    is_team_event: boolean;
    recurring_pattern: string;
  };
}

export const NewTeamEventDialog = ({
  open,
  onOpenChange,
  selectedDate,
  teamId,
  eventToEdit,
}: NewTeamEventDialogProps) => {
  const queryClient = useQueryClient();

  const createEvent = useMutation({
    mutationFn: async (values: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const eventDate = new Date(selectedDate!);
      const [startHours, startMinutes] = values.start_time.split(":");
      eventDate.setHours(parseInt(startHours), parseInt(startMinutes));

      let endDate = null;
      if (values.end_time) {
        endDate = new Date(selectedDate!);
        const [endHours, endMinutes] = values.end_time.split(":");
        endDate.setHours(parseInt(endHours), parseInt(endMinutes));
      }

      // Calculate recurring_day_of_week if pattern is weekly
      const recurring_day_of_week = values.recurring_pattern === 'weekly' 
        ? eventDate.getDay() 
        : null;

      if (eventToEdit) {
        const { error } = await supabase
          .from("team_calendar_events")
          .update({
            title: values.title,
            description: values.description,
            start_time: eventDate.toISOString(),
            end_time: endDate?.toISOString(),
            color: values.color,
            is_team_event: values.is_team_event,
            recurring_pattern: values.recurring_pattern,
            recurring_day_of_week,
          })
          .eq('id', eventToEdit.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("team_calendar_events")
          .insert({
            team_id: teamId,
            created_by: user.id,
            title: values.title,
            description: values.description,
            start_time: eventDate.toISOString(),
            end_time: endDate?.toISOString(),
            color: values.color,
            is_team_event: values.is_team_event,
            recurring_pattern: values.recurring_pattern,
            recurring_day_of_week,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-events"] });
      toast.success(eventToEdit ? "Termin aktualisiert" : "Termin erstellt");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(eventToEdit 
        ? "Der Termin konnte nicht aktualisiert werden."
        : "Der Termin konnte nicht erstellt werden.");
      console.error("Error with team event:", error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {eventToEdit ? "Termin bearbeiten" : "Neuer Team-Termin"} am{" "}
            {selectedDate &&
              format(selectedDate, "dd. MMMM yyyy", { locale: de })}
          </DialogTitle>
          <DialogDescription>
            Fülle die folgenden Felder aus, um {eventToEdit ? "den Termin zu aktualisieren" : "einen neuen Team-Termin zu erstellen"}.
          </DialogDescription>
        </DialogHeader>

        <TeamEventForm 
          onSubmit={(values) => createEvent.mutate(values)}
          defaultValues={eventToEdit}
          isEditing={!!eventToEdit}
        />
      </DialogContent>
    </Dialog>
  );
};