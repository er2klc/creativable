import { useState } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
}

interface FormValues {
  leadId: string;
  time: string;
  title: string;
  color: string;
  meeting_type: string;
}

const MEETING_TYPES = [
  { value: "phone_call", label: "Telefongespräch" },
  { value: "on_site", label: "Vor-Ort-Termin" },
  { value: "zoom", label: "Zoom Meeting" },
  { value: "initial_meeting", label: "Erstgespräch" },
  { value: "presentation", label: "Präsentation" },
  { value: "follow_up", label: "Folgetermin" }
];

export const NewAppointmentDialog = ({
  open,
  onOpenChange,
  selectedDate,
}: NewAppointmentDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<FormValues>();
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("leads")
        .select("id, name")
        .eq("user_id", user.id)
        .ilike("name", `%${searchValue}%`)
        .order("name");

      if (error) {
        console.error("Error fetching leads:", error);
        return [];
      }

      return data;
    },
  });

  const createAppointment = useMutation({
    mutationFn: async (values: FormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const appointmentDate = new Date(selectedDate!);
      const [hours, minutes] = values.time.split(":");
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        lead_id: values.leadId,
        title: values.title,
        due_date: appointmentDate.toISOString(),
        meeting_type: values.meeting_type,
        color: values.color,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Termin erstellt",
        description: "Der Termin wurde erfolgreich erstellt.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Fehler",
        description: "Der Termin konnte nicht erstellt werden.",
        variant: "destructive",
      });
      console.error("Error creating appointment:", error);
    },
  });

  const onSubmit = (values: FormValues) => {
    createAppointment.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Neuer Termin am{" "}
            {selectedDate &&
              format(selectedDate, "dd. MMMM yyyy", { locale: de })}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontakt</FormLabel>
                  <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? leads?.find((lead) => lead.id === field.value)?.name
                            : "Wähle einen Kontakt"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Suche nach Kontakten..."
                          value={searchValue}
                          onValueChange={setSearchValue}
                        />
                        <CommandEmpty>Keine Kontakte gefunden.</CommandEmpty>
                        <CommandGroup>
                          {leads?.map((lead) => (
                            <CommandItem
                              key={lead.id}
                              value={lead.name}
                              onSelect={() => {
                                form.setValue("leadId", lead.id);
                                setOpenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  lead.id === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {lead.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Uhrzeit</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Terminbeschreibung" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="meeting_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terminart</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? MEETING_TYPES.find(
                                (type) => type.value === field.value
                              )?.label
                            : "Wähle eine Terminart"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Suche Terminart..." />
                        <CommandEmpty>Keine Terminart gefunden.</CommandEmpty>
                        <CommandGroup>
                          {MEETING_TYPES.map((type) => (
                            <CommandItem
                              value={type.value}
                              key={type.value}
                              onSelect={() => {
                                form.setValue("meeting_type", type.value);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  type.value === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {type.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farbe</FormLabel>
                  <FormControl>
                    <Input
                      type="color"
                      {...field}
                      className="h-10 w-full"
                      defaultValue="#FEF7CD"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit">Termin erstellen</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};