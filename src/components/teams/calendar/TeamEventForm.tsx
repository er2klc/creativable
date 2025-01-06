import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { format, startOfDay, isValid, parseISO } from "date-fns";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamEventFormFields } from "./form/TeamEventFormFields";
import * as z from 'zod';

interface TeamEventFormProps {
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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (eventToEdit?.end_date) {
      const parsedEndDate = parseISO(eventToEdit.end_date);
      if (isValid(parsedEndDate)) {
        setEndDate(parsedEndDate);
      }
    }
    if (eventToEdit?.start_time) {
      const startDate = parseISO(eventToEdit.start_time);
      if (isValid(startDate)) {
        setSelectedDate(startDate);
      }
    } else if (initialSelectedDate && isValid(initialSelectedDate)) {
      setSelectedDate(initialSelectedDate);
    }
  }, [initialSelectedDate, eventToEdit]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: eventToEdit?.title || "",
      description: eventToEdit?.description || "",
      start_time: eventToEdit?.start_time && !eventToEdit?.is_multi_day 
        ? format(parseISO(eventToEdit.start_time), "HH:mm")
        : "09:00",
      end_time: eventToEdit?.end_time && !eventToEdit?.is_multi_day
        ? format(parseISO(eventToEdit.end_time), "HH:mm")
        : "",
      end_date: eventToEdit?.end_date || null,
      color: eventToEdit?.color || "#FEF7CD",
      is_team_event: eventToEdit?.is_team_event || false,
      recurring_pattern: eventToEdit?.recurring_pattern || "none",
      is_admin_only: eventToEdit?.is_admin_only || false,
      is_multi_day: eventToEdit?.is_multi_day || false,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!selectedDate) {
        throw new Error("Bitte wähle ein Datum aus");
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      let eventDate = startOfDay(selectedDate);
      let eventEndDate = values.is_multi_day ? endDate : selectedDate;

      // For multi-day events, we don't need time values
      if (!values.is_multi_day && values.start_time) {
        const [hours, minutes] = values.start_time.split(":");
        eventDate = new Date(selectedDate);
        eventDate.setHours(parseInt(hours), parseInt(minutes));
      }

      if (!values.is_multi_day && values.end_time) {
        const [endHours, endMinutes] = values.end_time.split(":");
        eventEndDate = new Date(selectedDate);
        eventEndDate.setHours(parseInt(endHours), parseInt(endMinutes));
      }

      const eventData = {
        team_id: teamId,
        title: values.title,
        description: values.description,
        start_time: eventDate.toISOString(),
        end_time: !values.is_multi_day ? eventEndDate?.toISOString() : null,
        end_date: values.is_multi_day ? eventEndDate?.toISOString() : null,
        color: values.color,
        is_team_event: values.is_team_event,
        recurring_pattern: values.recurring_pattern,
        is_admin_only: values.is_admin_only,
        is_multi_day: values.is_multi_day,
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

  const handleDateSelect = (date: Date | null) => {
    console.log("Date selected in team event form:", date);
    setSelectedDate(date);
  };

  const handleEndDateSelect = (date: Date | null) => {
    console.log("End date selected:", date);
    setEndDate(date);
    form.setValue("end_date", date?.toISOString() || null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => createEventMutation.mutate(values))} className="space-y-4">
        <TeamEventFormFields 
          form={form} 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          onEndDateSelect={handleEndDateSelect}
          endDate={endDate}
        />

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

export const formSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  end_date: z.string().nullable(),
  color: z.string().default("#FEF7CD"),
  is_team_event: z.boolean().default(false),
  is_admin_only: z.boolean().default(false),
  is_multi_day: z.boolean().default(false),
  recurring_pattern: z.enum(["none", "daily", "weekly", "monthly"]).default("none"),
});