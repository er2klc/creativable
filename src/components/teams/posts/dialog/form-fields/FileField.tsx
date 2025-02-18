
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Upload } from "lucide-react";
import { useState } from "react";

interface FileFieldProps {
  form: UseFormReturn<any>;
}

export const FileField = ({ form }: FileFieldProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      form.setValue("files", e.dataTransfer.files);
    }
  };

  return (
    <FormField
      control={form.control}
      name="files"
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel>Dateien anhängen</FormLabel>
          <FormControl>
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                dragActive ? "border-primary bg-primary/5" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <label className="flex flex-col items-center gap-2 cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground text-center">
                  <span className="font-medium text-primary">
                    Dateien auswählen
                  </span>{" "}
                  oder hierher ziehen
                </div>
                <Input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => onChange(e.target.files)}
                  {...field}
                />
              </label>
              {value && (
                <div className="mt-4 space-y-2">
                  {Array.from(value).map((file: File, index) => (
                    <div
                      key={index}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
