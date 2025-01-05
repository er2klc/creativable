import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface ColorFieldProps {
  form: UseFormReturn<any>;
}

export const ColorField = ({ form }: ColorFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="color"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Farbe</FormLabel>
          <FormControl>
            <Input
              type="color"
              {...field}
              className="h-10 w-full"
              defaultValue="#FEF7CD"
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};