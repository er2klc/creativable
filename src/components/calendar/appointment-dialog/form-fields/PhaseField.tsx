import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface PhaseFieldProps {
  form: UseFormReturn<any>;
}

export const PhaseField = ({ form }: PhaseFieldProps) => {
  // First get the default pipeline or last used pipeline
  const { data: pipeline } = useQuery({
    queryKey: ["default-pipeline"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const lastUsedPipelineId = localStorage.getItem('lastUsedPipelineId');
      
      let query = supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", user.id);

      if (lastUsedPipelineId) {
        query = query.eq("id", lastUsedPipelineId);
      }

      const { data, error } = await query.limit(1).single();

      if (error) {
        console.error("Error fetching pipeline:", error);
        return null;
      }

      // Store the pipeline ID for next time
      if (data) {
        localStorage.setItem('lastUsedPipelineId', data.id);
      }

      return data;
    },
  });

  // Then get the phases for that pipeline
  const { data: phases = [] } = useQuery({
    queryKey: ["pipeline-phases", pipeline?.id],
    queryFn: async () => {
      if (!pipeline?.id) return [];

      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("pipeline_id", pipeline.id)
        .order("order_index");

      if (error) {
        console.error("Error fetching phases:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!pipeline?.id,
  });

  return (
    <FormField
      control={form.control}
      name="phase"
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
                <SelectItem key={phase.id} value={phase.name}>
                  {phase.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};