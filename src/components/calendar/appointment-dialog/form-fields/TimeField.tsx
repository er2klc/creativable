import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface TimeFieldProps {
  form: UseFormReturn<any>;
}

export const TimeField = ({ form }: TimeFieldProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Startzeit</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="end_time"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endzeit (optional)</FormLabel>
            <FormControl>
              <Input type="time" {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};