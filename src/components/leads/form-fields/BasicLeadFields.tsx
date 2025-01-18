import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { platformsConfig } from "@/config/platforms";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface BasicLeadFieldsProps {
  form: any;
}

export function BasicLeadFields({ form }: BasicLeadFieldsProps) {
  const session = useSession();

  const { data: pipelines = [] } = useQuery({
    queryKey: ["pipelines"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: phases = [] } = useQuery({
    queryKey: ["phases", form.watch("pipeline_id")],
    queryFn: async () => {
      const pipelineId = form.watch("pipeline_id");
      if (!pipelineId) return [];

      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipelineId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
    enabled: !!form.watch("pipeline_id"),
  });

  return (
    <>
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
        name="pipeline_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pipeline</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wähle eine Pipeline" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {pipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
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
        name="phase_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phase</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
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
        name="platform"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Plattform</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Wähle eine Plattform" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {platformsConfig.map((platform) => (
                  <SelectItem key={platform.name} value={platform.name}>
                    <div className="flex items-center gap-2">
                      <platform.icon className="h-4 w-4" />
                      {platform.label}
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
        name="social_media_username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Benutzername</FormLabel>
            <FormControl>
              <Input placeholder="Benutzername auf der Plattform" {...field} />
            </FormControl>
            <FormDescription>
              Der Benutzername oder die URL zum Profil
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}