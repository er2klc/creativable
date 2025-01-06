import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormLabel } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format, isValid } from "date-fns";
import { de } from "date-fns/locale";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamEventFormFields, formSchema } from "./form/TeamEventFormFields";

export interface TeamEventFormProps {
  teamId: string;
  selectedDate: Date | null;
  eventToEdit?: any;
  onClose: () => void;
  onDisableInstance?: (date: Date) => void;
}

export const TeamEventForm = ({ 
  teamId,
  selectedDate: initialSelectedDate,
  eventToEdit,
  onClose,
  onDisableInstance
}: TeamEventFormProps) => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialSelectedDate);

  useEffect(() => {
    setSelectedDate(initialSelectedDate);
  }, [initialSelectedDate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: eventToEdit?.title || "",
      description: eventToEdit?.description || "",
      start_time: eventToEdit?.start_time && isValid(new Date(eventToEdit.start_time)) 
        ? format(new Date(eventToEdit.start_time), "HH:mm")
        : "09:00",
      end_time: eventToEdit?.end_time && isValid(new Date(eventToEdit.end_time))
        ? format(new Date(eventToEdit.end_time), "HH:mm")
        : "",
      color: eventToEdit?.color || "#FEF7CD",
      is_team_event: eventToEdit?.is_team_event || false,
      recurring_pattern: eventToEdit?.recurring_pattern || "none",
      is_admin_only: eventToEdit?.is_admin_only || false,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!selectedDate) {
        throw new Error("Bitte wähle ein Datum aus");
      }

      const eventDate = new Date(selectedDate);
      const [hours, minutes] = values.start_time.split(":");
      eventDate.setHours(parseInt(hours), parseInt(minutes));

      let endDate = null;
      if (values.end_time) {
        const [endHours, endMinutes] = values.end_time.split(":");
        endDate = new Date(selectedDate);
        endDate.setHours(parseInt(endHours), parseInt(endMinutes));
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const eventData = {
        team_id: teamId,
        title: values.title,
        description: values.description,
        start_time: eventDate.toISOString(),
        end_time: endDate?.toISOString() || null,
        color: values.color,
        is_team_event: values.is_team_event,
        recurring_pattern: values.recurring_pattern,
        is_admin_only: values.is_admin_only,
        created_by: user.id,
      };

      if (eventToEdit) {
        const { error } = await supabase
          .from("team_calendar_events")
          .update(eventData)
          .eq("id", eventToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("team_calendar_events")
          .insert(eventData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-events"] });
      toast.success(
        eventToEdit
          ? "Termin erfolgreich aktualisiert"
          : "Termin erfolgreich erstellt"
      );
      onClose();
    },
    onError: (error) => {
      console.error("Error saving event:", error);
      if (error instanceof Error && error.message === "Bitte wähle ein Datum aus") {
        toast.error(error.message);
      } else {
        toast.error("Fehler beim Speichern des Termins");
      }
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => createEventMutation.mutate(values))} className="space-y-4">
        <div className="space-y-2">
          <FormLabel>Datum</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
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
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <TeamEventFormFields form={form} />

        <div className="flex justify-between pt-4">
          {eventToEdit?.isRecurring && onDisableInstance && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (selectedDate && onDisableInstance) {
                  onDisableInstance(selectedDate);
                }
              }}
            >
              Diese Instanz überspringen
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit">
              {eventToEdit ? "Aktualisieren" : "Erstellen"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};