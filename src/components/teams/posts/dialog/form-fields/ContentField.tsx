
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
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
            <RichTextEditor
              content={field.value}
              onChange={field.onChange}
              placeholder="Beschreibe deinen Beitrag... (@mention für Erwähnungen)"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
