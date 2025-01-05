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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { AppointmentForm } from "./appointment-dialog/AppointmentForm";
import { useState, useEffect } from "react";

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
  selectedDate: initialSelectedDate,
  appointmentToEdit,
}: NewAppointmentDialogProps) => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Update selectedDate when initialSelectedDate or open changes
  useEffect(() => {
    if (open) {
      setSelectedDate(initialSelectedDate);
    }
  }, [initialSelectedDate, open]);

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
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast.success(appointmentToEdit ? "Termin aktualisiert" : "Termin erstellt");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(appointmentToEdit 
        ? "Der Termin konnte nicht aktualisiert werden."
        : "Der Termin konnte nicht erstellt werden.");
      console.error("Error with appointment:", error);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="space-y-2">
            <div>{appointmentToEdit ? "Termin bearbeiten" : "Neuer Termin"}</div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal w-full",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "dd. MMMM yyyy", { locale: de })
                  ) : (
                    <span>Datum wählen</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate || undefined}
                  onSelect={(date) => setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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