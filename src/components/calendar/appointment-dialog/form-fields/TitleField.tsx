import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface TitleFieldProps {
  form: UseFormReturn<any>;
}

export const TitleField = ({ form }: TitleFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Titel</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Terminbeschreibung" />
          </FormControl>
        </FormItem>
      )}
    />
  );
};