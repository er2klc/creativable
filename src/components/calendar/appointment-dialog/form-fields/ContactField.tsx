import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ContactFieldProps {
  form: UseFormReturn<any>;
}

export const ContactField = ({ form }: ContactFieldProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const { data: leads = [] } = useQuery({
    queryKey: ["leads", searchValue],
    queryFn: async () => {
      try {
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

        return data || [];
      } catch (error) {
        console.error("Error in leads query:", error);
        return [];
      }
    },
  });

  return (
    <FormField
      control={form.control}
      name="leadId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Kontakt</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {field.value
                    ? leads.find((lead) => lead.id === field.value)?.name
                    : "Wähle einen Kontakt"}
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
                <CommandGroup className="max-h-[200px] overflow-y-auto">
                  {leads.map((lead) => (
                    <CommandItem
                      key={lead.id}
                      value={lead.name}
                      onSelect={() => {
                        form.setValue("leadId", lead.id);
                        setOpen(false);
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
};