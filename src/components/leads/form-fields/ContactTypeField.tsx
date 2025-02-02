import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../AddLeadFormFields";

interface ContactTypeFieldProps {
  form: UseFormReturn<FormData>;
}

export function ContactTypeField({ form }: ContactTypeFieldProps) {
  const currentValue = form.watch("contact_type") || "";
  const currentTypes = currentValue ? currentValue.split(",") : [];

  const handleCheckboxChange = (type: string, checked: boolean) => {
    let newTypes = [...currentTypes];
    
    if (checked) {
      if (!newTypes.includes(type)) {
        newTypes.push(type);
      }
    } else {
      newTypes = newTypes.filter(t => t !== type);
    }
    
    form.setValue("contact_type", newTypes.join(","), { shouldValidate: true });
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
                  currentTypes.includes("Partner") ? "bg-[#60A5FA]/30" : ""
                }`}>
                  <Checkbox
                    checked={currentTypes.includes("Partner")}
                    onCheckedChange={(checked) => handleCheckboxChange("Partner", checked as boolean)}
                  />
                  <span className="ml-2">Likely Partner</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg transition-colors ${
                  currentTypes.includes("Kunde") ? "bg-[#4ADE80]/30" : ""
                }`}>
                  <Checkbox
                    checked={currentTypes.includes("Kunde")}
                    onCheckedChange={(checked) => handleCheckboxChange("Kunde", checked as boolean)}
                  />
                  <span className="ml-2">Likely Kunde</span>
                </div>
              </div>
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}