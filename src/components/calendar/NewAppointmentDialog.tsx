import { format } from "date-fns";
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
import { AppointmentForm } from "./appointment-dialog/AppointmentForm";
import { useState, useEffect } from "react";
import { DateSelector } from "./appointment-dialog/DateSelector";
import { CompletionCheckbox } from "./appointment-dialog/CompletionCheckbox";

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedDate: Date | null;
  appointmentToEdit?: {
    id: string;
    leadId: string;
    time: string;
    title: string;
    color: string;
    meeting_type: string;
    completed?: boolean;
    cancelled?: boolean;
  };
}

export const NewAppointmentDialog = ({
  open,
  onOpenChange,
  initialSelectedDate,
  appointmentToEdit,
}: NewAppointmentDialogProps) => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [completed, setCompleted] = useState(appointmentToEdit?.completed || false);
  const [cancelled, setCancelled] = useState(appointmentToEdit?.cancelled || false);

  useEffect(() => {
    if (open) {
      setSelectedDate(initialSelectedDate);
      setCompleted(appointmentToEdit?.completed || false);
      setCancelled(appointmentToEdit?.cancelled || false);
    }
  }, [initialSelectedDate, open, appointmentToEdit]);

  const createAppointment = useMutation({
    mutationFn: async (values: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!selectedDate) {
        throw new Error("Bitte wähle ein Datum aus");
      }

      const appointmentDate = new Date(selectedDate);
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
            completed: completed,
            cancelled: cancelled,
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
          completed: completed,
          cancelled: cancelled,
        });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(appointmentToEdit ? "Termin aktualisiert" : "Termin erstellt");
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof Error && error.message === "Bitte wähle ein Datum aus") {
        toast.error(error.message);
      } else {
        toast.error(appointmentToEdit 
          ? "Der Termin konnte nicht aktualisiert werden."
          : "Der Termin konnte nicht erstellt werden.");
        console.error("Error with appointment:", error);
      }
    },
  });

  const handleDateSelect = (date: Date | null) => {
    console.log("Date selected in dialog:", date);
    setSelectedDate(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {appointmentToEdit ? "Termin bearbeiten" : "Neuer Termin"}
          </DialogTitle>
          <DialogDescription>
            Fülle die folgenden Felder aus, um {appointmentToEdit ? "den Termin zu aktualisieren" : "einen neuen Termin zu erstellen"}.
          </DialogDescription>
          <div className="mt-4">
            <DateSelector 
              selectedDate={selectedDate} 
              onDateSelect={handleDateSelect}
            />
          </div>
        </DialogHeader>

        <AppointmentForm 
          onSubmit={(values) => {
            if (!selectedDate) {
              toast.error("Bitte wähle ein Datum aus");
              return;
            }
            createAppointment.mutate(values);
          }}
          defaultValues={appointmentToEdit}
          isEditing={!!appointmentToEdit}
        />

        <div className="flex items-center justify-between mt-6">
          {appointmentToEdit && (
            <CompletionCheckbox 
              completed={completed}
              cancelled={cancelled}
              onChange={(newCompleted, newCancelled) => {
                setCompleted(newCompleted);
                setCancelled(newCancelled);
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};