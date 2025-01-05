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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { useState } from "react";

interface Lead {
  id: string;
  name: string;
}

interface ContactFieldProps {
  form: UseFormReturn<any>;
}

export const ContactField = ({ form }: ContactFieldProps) => {
  const [showAddLead, setShowAddLead] = useState(false);

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
    <>
      <FormField
        control={form.control}
        name="leadId"
        rules={{ required: "Bitte wähle einen Kontakt aus" }}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Kontakt</FormLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wähle einen Kontakt" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                type="button"
                onClick={() => setShowAddLead(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      {showAddLead && (
        <AddLeadDialog 
          trigger={<div style={{ display: 'none' }} />}
          open={showAddLead}
          onClose={() => setShowAddLead(false)}
        />
      )}
    </>
  );
};