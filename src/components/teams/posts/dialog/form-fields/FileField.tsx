
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Image, Hash } from "lucide-react";

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
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={(e) => onChange(e.target.files)}
                {...field}
                className={cn(
                  "hidden peer",
                )}
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-md border border-input",
                  "bg-white hover:bg-accent cursor-pointer transition-colors",
                  "text-sm text-muted-foreground",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
                )}
              >
                <Image className="h-4 w-4" />
                <Hash className="h-4 w-4" />
                <span>Bilder oder Hashtags hinzufügen...</span>
              </label>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
