import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Platform } from "@/config/platforms";

interface BasicLeadFieldsProps {
  form: UseFormReturn<any>;
}

export function BasicLeadFields({ form }: BasicLeadFieldsProps) {
  const session = useSession();

  // First get the default pipeline
  const { data: pipeline } = useQuery({
    queryKey: ["default-pipeline"],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("name", "Standard Pipeline")
        .order("order_index")
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Then get the phases for that pipeline
  const { data: phases = [] } = useQuery({
    queryKey: ["pipeline-phases", pipeline?.id],
    queryFn: async () => {
      if (!session?.user?.id || !pipeline?.id) return [];
      
      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipeline.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id && !!pipeline?.id,
  });

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input placeholder="Name des Kontakts" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plattform</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wähle eine Plattform" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Facebook">Facebook</SelectItem>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Andere">Andere</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phase_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phase</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wähle eine Phase" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase.id} value={phase.id}>
                    {phase.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Branche</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wähle eine Branche" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Nicht angegeben">Nicht angegeben</SelectItem>
                <SelectItem value="Dienstleistungen">Dienstleistungen</SelectItem>
                <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                <SelectItem value="Einzelhandel">Einzelhandel</SelectItem>
                <SelectItem value="Finanzen">Finanzen</SelectItem>
                <SelectItem value="Gesundheit">Gesundheit</SelectItem>
                <SelectItem value="Handwerk">Handwerk</SelectItem>
                <SelectItem value="Immobilien">Immobilien</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Medien">Medien</SelectItem>
                <SelectItem value="Produktion">Produktion</SelectItem>
                <SelectItem value="Technologie">Technologie</SelectItem>
                <SelectItem value="Andere">Andere</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}