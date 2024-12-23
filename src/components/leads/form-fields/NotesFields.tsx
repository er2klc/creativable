import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../AddLeadFormFields";
import { StickyNote } from "lucide-react";

interface NotesFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function NotesFields({ form }: NotesFieldsProps) {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            Notizen 📌
          </FormLabel>
          <FormControl>
            <Textarea
              placeholder="Zusätzliche Informationen zum Lead..."
              className="resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}