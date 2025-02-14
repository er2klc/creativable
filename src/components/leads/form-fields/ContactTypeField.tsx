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
          <FormLabel>Kontakttyp (Erste Einschätzung)</FormLabel>
          <FormControl>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg transition-colors ${
                  currentTypes.includes("Likely Partner") ? "bg-[#F0FAFF]" : ""
                }`}>
                  <Checkbox
                    checked={currentTypes.includes("Likely Partner")}
                    onCheckedChange={(checked) => 
                      handleContactTypeChange("Likely Partner", checked as boolean)
                    }
                    id="partner"
                  />
                  <label 
                    htmlFor="partner" 
                    className="ml-2 text-sm font-medium cursor-pointer"
                  >
                    Likely Partner
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg transition-colors ${
                  currentTypes.includes("Likely Kunde") ? "bg-[#F0FFF0]" : ""
                }`}>
                  <Checkbox
                    checked={currentTypes.includes("Likely Kunde")}
                    onCheckedChange={(checked) => 
                      handleContactTypeChange("Likely Kunde", checked as boolean)
                    }
                    id="kunde"
                  />
                  <label 
                    htmlFor="kunde" 
                    className="ml-2 text-sm font-medium cursor-pointer"
                  >
                    Likely Kunde
                  </label>
                </div>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}