import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().optional(),
  start_time: z.string(),
  end_time: z.string().optional(),
  color: z.string().default("#FEF7CD"),
  is_team_event: z.boolean().default(false),
  recurring_pattern: z.enum(["none", "daily", "weekly"]).default("none"),
  is_admin_only: z.boolean().default(false),
});

export interface TeamEventFormProps {
  teamId: string;
  selectedDate: Date | null;
  eventToEdit?: any;
  onClose: () => void;
  onDisableInstance?: (date: Date) => void;
}

export const TeamEventForm = ({ 
  teamId,
  selectedDate,
  eventToEdit,
  onClose,
  onDisableInstance
}: TeamEventFormProps) => {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: eventToEdit?.title || "",
      description: eventToEdit?.description || "",
      start_time: eventToEdit?.start_time || "09:00",
      end_time: eventToEdit?.end_time || "",
      color: eventToEdit?.color || "#FEF7CD",
      is_team_event: eventToEdit?.is_team_event || false,
      recurring_pattern: eventToEdit?.recurring_pattern || "none",
      is_admin_only: eventToEdit?.is_admin_only || false,
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const eventDate = selectedDate || new Date();
      const [hours, minutes] = values.start_time.split(":");
      eventDate.setHours(parseInt(hours), parseInt(minutes));

      let endDate = null;
      if (values.end_time) {
        const [endHours, endMinutes] = values.end_time.split(":");
        endDate = new Date(eventDate);
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
      toast.error("Fehler beim Speichern des Termins");
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    createEventMutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titel</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Startzeit</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Endzeit (optional)</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farbe</FormLabel>
              <FormControl>
                <Input type="color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recurring_pattern"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wiederholung</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie ein Muster" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Keine Wiederholung</SelectItem>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_admin_only"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Admin-Termin
                </FormLabel>
                <FormDescription>
                  Dieser Termin ist nur für Team-Admins sichtbar
                </FormDescription>
              </div>
            </FormItem>
          )}
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
