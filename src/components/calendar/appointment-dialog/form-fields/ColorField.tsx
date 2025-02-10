
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColorFieldProps {
  form: UseFormReturn<any>;
}

const PASTEL_COLORS = [
  { value: "#F2FCE2", label: "Soft Green" },
  { value: "#FEF7CD", label: "Soft Yellow" },
  { value: "#FEC6A1", label: "Soft Orange" },
  { value: "#E5DEFF", label: "Soft Purple" },
  { value: "#FFDEE2", label: "Soft Pink" },
  { value: "#FDE1D3", label: "Soft Peach" },
  { value: "#D3E4FD", label: "Soft Blue" },
  { value: "#F1F0FB", label: "Soft Gray" },
];

export const ColorField = ({ form }: ColorFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="color"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Farbe</FormLabel>
          <FormControl>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: field.value }}
                    />
                    {PASTEL_COLORS.find(color => color.value === field.value)?.label || "Wähle eine Farbe"}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PASTEL_COLORS.map((color) => (
                  <SelectItem 
                    key={color.value} 
                    value={color.value}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
        </FormItem>
      )}
    />
  );
};
