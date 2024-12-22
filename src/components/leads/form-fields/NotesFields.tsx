import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../AddLeadFormFields";

interface NotesFieldsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function NotesFields({ form }: NotesFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="lastAction"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Letzte Aktion 📝</FormLabel>
            <FormControl>
              <Input placeholder="z.B. Nachricht gesendet" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notizen 📌</FormLabel>
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
    </>
  );
}