
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";

interface ContentFieldProps {
  form: UseFormReturn<any>;
}

export const ContentField = ({ form }: ContentFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="content"
      rules={{ required: "Inhalt ist erforderlich" }}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Inhalt</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Beschreibe deinen Beitrag... (@mention für Erwähnungen)"
              className="min-h-[200px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
