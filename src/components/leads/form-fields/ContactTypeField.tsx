import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../AddLeadFormFields";

interface ContactTypeFieldProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function ContactTypeField({ form }: ContactTypeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="contact_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Kontakttyp</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value || undefined}
              className="flex space-x-4"
            >
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <RadioGroupItem value="Partner" />
                </FormControl>
                <FormLabel className="font-normal">
                  Partner
                </FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <RadioGroupItem value="Kunde" />
                </FormControl>
                <FormLabel className="font-normal">
                  Kunde
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}