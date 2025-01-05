import { useState, useEffect } from "react";
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
  CommandList, // Stelle sicher, dass CommandList importiert ist
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface Lead {
  id: string;
  name: string;
}

interface ContactFieldProps {
  form: UseFormReturn<any>;
}

export const ContactField = ({ form }: ContactFieldProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Optional: Debounce den Suchwert, um die Anzahl der Abfragen zu reduzieren
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchValue);
    }, 300); // 300ms Verzögerung

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);

  const { data: leads = [], error, isLoading } = useQuery({
    queryKey: ["leads", debouncedSearch],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Benutzer nicht authentifiziert");

        const { data, error } = await supabase
          .from("leads")
          .select("id, name")
          .eq("user_id", user.id)
          .ilike("name", `%${debouncedSearch}%`) // Korrigierte Syntax
          .order("name");

        if (error) {
          console.error("Fehler beim Abrufen der Kontakte:", error);
          return [];
        }

        return (data || []) as Lead[];
      } catch (error) {
        console.error("Allgemeiner Fehler:", error);
        return [];
      }
    },
    refetchOnWindowFocus: false,
  });

  // Debugging: Überprüfe die Suchwerte und Daten
  useEffect(() => {
    console.log("Suchwert geändert:", debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    console.log("Abgerufene Leads:", leads);
    if (error) {
      console.error("Abfragefehler:", error);
    }
  }, [leads, error]);

  const leadsData = Array.isArray(leads) ? leads : [];
  const selectedLead = leadsData.find((lead) => lead.id === form.getValues("leadId"));

  return (
    <FormField
      control={form.control}
      name="leadId"
      rules={{ required: "Bitte wähle einen Kontakt aus" }}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Kontakt</FormLabel>
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
                  {selectedLead?.name || "Wähle einen Kontakt"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              {isLoading ? (
                <div className="p-4">Lädt Kontakte...</div>
              ) : (
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Suche nach Kontakten..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList> {/* Hinzugefügte CommandList */}
                    {leadsData.length > 0 ? (
                      <CommandGroup>
                        {leadsData.map((lead) => (
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
                                lead.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {lead.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ) : (
                      <CommandEmpty>Keine Kontakte gefunden.</CommandEmpty>
                    )}
                  </CommandList>
                </Command>
              )}
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
