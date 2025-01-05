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
    <FormField
      control={form.control}
      name="time"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Uhrzeit</FormLabel>
          <FormControl>
            <Input type="time" {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};