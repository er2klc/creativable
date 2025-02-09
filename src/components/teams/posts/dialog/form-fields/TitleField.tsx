
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
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
      rules={{ required: "Titel ist erforderlich" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Titel</FormLabel>
          <FormControl>
            <Input placeholder="Titel des Beitrags" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
