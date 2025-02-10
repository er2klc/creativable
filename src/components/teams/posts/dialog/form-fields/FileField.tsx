
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface FileFieldProps {
  form: UseFormReturn<any>;
}

export const FileField = ({ form }: FileFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="files"
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel>Dateien anhängen</FormLabel>
          <FormControl>
            <Input
              type="file"
              multiple
              onChange={(e) => onChange(e.target.files)}
              {...field}
              className="cursor-pointer"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
