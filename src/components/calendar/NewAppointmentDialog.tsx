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
import { useToast } from "@/hooks/use-toast";
import { AppointmentForm } from "./appointment-dialog/AppointmentForm";

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  appointmentToEdit?: {
    id: string;
    leadId: string;
    time: string;
    title: string;
    color: string;
    meeting_type: string;
  };
}

export const NewAppointmentDialog = ({
  open,
  onOpenChange,
  selectedDate,
  appointmentToEdit,
}: NewAppointmentDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAppointment = useMutation({
    mutationFn: async (values: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const appointmentDate = new Date(selectedDate!);
      const [hours, minutes] = values.time.split(":");
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      if (appointmentToEdit) {
        const { error } = await supabase
          .from("tasks")
          .update({
            lead_id: values.leadId,
            title: values.title,
            due_date: appointmentDate.toISOString(),
            meeting_type: values.meeting_type,
            color: values.color,
          })
          .eq('id', appointmentToEdit.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("tasks").insert({
          user_id: user.id,
          lead_id: values.leadId,
          title: values.title,
          due_date: appointmentDate.toISOString(),
          meeting_type: values.meeting_type,
          color: values.color,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: appointmentToEdit ? "Termin aktualisiert" : "Termin erstellt",
        description: appointmentToEdit 
          ? "Der Termin wurde erfolgreich aktualisiert."
          : "Der Termin wurde erfolgreich erstellt.",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: appointmentToEdit 
          ? "Der Termin konnte nicht aktualisiert werden."
          : "Der Termin konnte nicht erstellt werden.",
        variant: "destructive",
      });
      console.error("Error with appointment:", error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {appointmentToEdit ? "Termin bearbeiten" : "Neuer Termin"} am{" "}
            {selectedDate &&
              format(selectedDate, "dd. MMMM yyyy", { locale: de })}
          </DialogTitle>
          <DialogDescription>
            Fülle die folgenden Felder aus, um {appointmentToEdit ? "den Termin zu aktualisieren" : "einen neuen Termin zu erstellen"}.
          </DialogDescription>
        </DialogHeader>

        <AppointmentForm 
          onSubmit={(values) => createAppointment.mutate(values)}
          defaultValues={appointmentToEdit}
          isEditing={!!appointmentToEdit}
        />
      </DialogContent>
    </Dialog>
  );
};