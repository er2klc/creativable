import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "../AddLeadFormFields";

interface ContactTypeFieldProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export function ContactTypeField({ form }: ContactTypeFieldProps) {
  const currentTypes = form.watch('contact_type')?.split(',').filter(Boolean) || [];

  const handleContactTypeChange = (type: string, checked: boolean) => {
    const types = new Set(currentTypes);
    if (checked) {
      types.add(type);
    } else {
      types.delete(type);
    }
    const newValue = Array.from(types).join(',');
    form.setValue('contact_type', newValue || null);
  };

  return (
    <FormField
      control={form.control}
      name="contact_type"
      render={() => (
        <FormItem>
          <FormLabel>Kontakttyp</FormLabel>
          <FormControl>
            <div className="flex items-center gap-6 bg-accent/50 px-6 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={currentTypes.includes("Partner")}
                  onCheckedChange={(checked) => 
                    handleContactTypeChange("Partner", checked as boolean)
                  }
                  id="partner"
                />
                <label 
                  htmlFor="partner" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Partner
                </label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={currentTypes.includes("Kunde")}
                  onCheckedChange={(checked) => 
                    handleContactTypeChange("Kunde", checked as boolean)
                  }
                  id="kunde"
                />
                <label 
                  htmlFor="kunde" 
                  className="text-sm font-medium cursor-pointer"
                >
                  Kunde
                </label>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}