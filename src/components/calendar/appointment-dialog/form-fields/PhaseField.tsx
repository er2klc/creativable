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
  const { data: phases = [] } = useQuery({
    queryKey: ["pipeline-phases"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("pipeline_phases")
        .select("*")
        .eq("user_id", user.id)
        .order("order_index");

      if (error) {
        console.error("Error fetching phases:", error);
        return [];
      }

      return data || [];
    },
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