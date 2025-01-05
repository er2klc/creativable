import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";

const MEETING_TYPES = [
  { value: "meeting", label: "Meeting" },
  { value: "call", label: "Telefonat" },
  { value: "video_call", label: "Video Call" },
  { value: "follow_up", label: "Follow-up" },
];

interface MeetingTypeFieldProps {
  form: UseFormReturn<any>;
}

export const MeetingTypeField = ({ form }: MeetingTypeFieldProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredTypes = MEETING_TYPES.filter(type => 
    type.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <FormField
      control={form.control}
      name="meeting_type"
      rules={{ required: "Bitte wähle eine Terminart aus" }}
      render={({ field }) => (
        <FormItem className="flex flex-col">
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
                    MEETING_TYPES.find(type => type.value === field.value)?.label
                  ) : (
                    "Wähle eine Terminart"
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Suche Terminart..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandEmpty>Keine Terminart gefunden.</CommandEmpty>
                <CommandGroup>
                  {filteredTypes.map((type) => (
                    <CommandItem
                      key={type.value}
                      value={type.value}
                      onSelect={() => {
                        form.setValue("meeting_type", type.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          type.value === field.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {type.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};