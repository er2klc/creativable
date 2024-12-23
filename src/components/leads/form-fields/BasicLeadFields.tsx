import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Globe, Building2, Phone, Mail, Briefcase } from "lucide-react";
import * as z from "zod";
import { formSchema } from "../AddLeadFormFields";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BasicLeadFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function BasicLeadFields({ form }: BasicLeadFieldsProps) {
  const { data: phases = [] } = useQuery({
    queryKey: ["lead-phases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lead_phases")
        .select("*")
        .order("order_index");
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name 👤</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
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
            <FormLabel>Phase 📊</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Phase" />
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

      <div className="flex items-center gap-4">
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Plattform
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen Sie eine Plattform" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {["Instagram", "LinkedIn", "Facebook", "TikTok"].map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
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
            <FormItem className="flex-1">
              <FormLabel>Benutzername 📱</FormLabel>
              <FormControl>
                <Input placeholder="Benutzername (ohne @ oder URL)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Branche
            </FormLabel>
            <FormControl>
              <Input placeholder="Branche eingeben" {...field} />
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
              <Input type="tel" placeholder="Telefonnummer eingeben" {...field} />
            </FormControl>
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
              <Input type="email" placeholder="E-Mail eingeben" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="company_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Firma
            </FormLabel>
            <FormControl>
              <Input placeholder="Firmennamen eingeben" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}