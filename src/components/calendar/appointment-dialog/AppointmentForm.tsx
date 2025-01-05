import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Phone, MapPin, Video, Users, BarChart, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FormValues {
  leadId: string;
  time: string;
  title: string;
  color: string;
  meeting_type: string;
}

const MEETING_TYPES = [
  { value: "phone_call", label: "Telefongespräch", icon: <Phone className="h-4 w-4" /> },
  { value: "on_site", label: "Vor-Ort-Termin", icon: <MapPin className="h-4 w-4" /> },
  { value: "zoom", label: "Zoom Meeting", icon: <Video className="h-4 w-4" /> },
  { value: "initial_meeting", label: "Erstgespräch", icon: <Users className="h-4 w-4" /> },
  { value: "presentation", label: "Präsentation", icon: <BarChart className="h-4 w-4" /> },
  { value: "follow_up", label: "Folgetermin", icon: <RefreshCw className="h-4 w-4" /> }
];

interface AppointmentFormProps {
  onSubmit: (values: FormValues) => void;
  defaultValues?: Partial<FormValues>;
  isEditing?: boolean;
}

export const AppointmentForm = ({ onSubmit, defaultValues, isEditing }: AppointmentFormProps) => {
  const form = useForm<FormValues>({
    defaultValues: defaultValues || {
      color: "#FEF7CD"
    }
  });
  const [searchValue, setSearchValue] = useState("");
  const [openMeetingType, setOpenMeetingType] = useState(false);

  const { data: leads } = useQuery({
    queryKey: ["leads", searchValue],
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="leadId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kontakt</FormLabel>
              <Command className="border rounded-md">
                <CommandInput 
                  placeholder="Suche nach Kontakten..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandEmpty>Keine Kontakte gefunden.</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {leads?.map((lead) => (
                    <CommandItem
                      key={lead.id}
                      value={lead.name}
                      onSelect={() => {
                        form.setValue("leadId", lead.id);
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
              <Popover open={openMeetingType} onOpenChange={setOpenMeetingType}>
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
                      {field.value ? (
                        <div className="flex items-center gap-2">
                          {MEETING_TYPES.find(type => type.value === field.value)?.icon}
                          {MEETING_TYPES.find(type => type.value === field.value)?.label}
                        </div>
                      ) : (
                        "Wähle eine Terminart"
                      )}
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
                            setOpenMeetingType(false);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            {type.icon}
                            {type.label}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                type.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </div>
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
          <Button type="submit">{isEditing ? "Termin aktualisieren" : "Termin erstellen"}</Button>
        </div>
      </form>
    </Form>
  );
};