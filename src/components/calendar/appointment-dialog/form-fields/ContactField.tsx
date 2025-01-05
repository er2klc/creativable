import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface ContactFieldProps {
  form: UseFormReturn<any>;
}

export const ContactField = ({ form }: ContactFieldProps) => {
  const [searchValue, setSearchValue] = useState("");

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
  );
};