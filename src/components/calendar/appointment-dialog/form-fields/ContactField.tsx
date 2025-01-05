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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface Lead {
  id: string;
  name: string;
}

interface ContactFieldProps {
  form: UseFormReturn<any>;
}

export const ContactField = ({ form }: ContactFieldProps) => {
  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Benutzer nicht authentifiziert");

        const { data, error } = await supabase
          .from("leads")
          .select("id, name")
          .eq("user_id", user.id)
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
  });

  if (isLoading) {
    return <div>Lädt Kontakte...</div>;
  }

  return (
    <FormField
      control={form.control}
      name="leadId"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>Kontakt (optional)</FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wähle einen Kontakt" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <p className="text-sm text-muted-foreground">
            Sie können auch Termine ohne Kontaktzuordnung erstellen
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};