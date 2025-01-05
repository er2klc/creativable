import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Platform, platformsConfig } from "@/config/platforms";
import { User, Globe, AtSign, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import * as z from "zod";

interface BasicLeadFieldsProps {
  form: UseFormReturn<any>;
}

export function BasicLeadFields({ form }: BasicLeadFieldsProps) {
  const session = useSession();

  const { data: phases = [] } = useQuery({
    queryKey: ["lead-phases"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("lead_phases")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (error) {
        console.error("Error loading phases:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Name
            </FormLabel>
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
            <FormLabel className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Kontaktquelle
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wo haben Sie den Kontakt kennengelernt?" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {platformsConfig.map((platform) => (
                  <SelectItem key={platform.name} value={platform.name}>
                    <div className="flex items-center gap-2">
                      <platform.icon className="h-4 w-4 text-gray-900" />
                      {platform.name}
                    </div>
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
        name="socialMediaUsername"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <AtSign className="h-4 w-4" />
              Social Media Benutzername
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Benutzername (ohne @ oder URL)" 
                {...field}
                onChange={(e) => {
                  const username = e.target.value.replace(/^@/, '');
                  field.onChange(username);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phase"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Phase
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Phase des Kontakts" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {phases.map((phase) => (
                  <SelectItem key={phase.id} value={phase.name}>
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
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-Mail
            </FormLabel>
            <FormControl>
              <Input type="email" placeholder="E-Mail-Adresse" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Telefonnummer
            </FormLabel>
            <FormControl>
              <Input placeholder="Telefonnummer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}