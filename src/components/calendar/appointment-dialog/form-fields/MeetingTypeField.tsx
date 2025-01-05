import { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
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
import { UseFormReturn } from "react-hook-form";

const MEETING_TYPES = [
  { value: "phone_call", label: "Telefongespräch", icon: <Phone className="h-4 w-4" /> },
  { value: "on_site", label: "Vor-Ort-Termin", icon: <MapPin className="h-4 w-4" /> },
  { value: "zoom", label: "Zoom Meeting", icon: <Video className="h-4 w-4" /> },
  { value: "initial_meeting", label: "Erstgespräch", icon: <Users className="h-4 w-4" /> },
  { value: "presentation", label: "Präsentation", icon: <BarChart className="h-4 w-4" /> },
  { value: "follow_up", label: "Folgetermin", icon: <RefreshCw className="h-4 w-4" /> }
];

interface MeetingTypeFieldProps {
  form: UseFormReturn<any>;
}

export const MeetingTypeField = ({ form }: MeetingTypeFieldProps) => {
  const [open, setOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name="meeting_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Terminart</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
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
                        setOpen(false);
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
  );
};