
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FileFieldProps {
  form: UseFormReturn<any>;
  existingFiles?: string[];
  onDeleteFile?: (url: string) => void;
}

export const FileField = ({ form, existingFiles, onDeleteFile }: FileFieldProps) => {
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

  const isImage = (url: string) => {
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  };

  return (
    <FormField
      control={form.control}
      name="files"
      render={({ field: { onChange, value, ...field } }) => (
        <FormItem>
          <FormLabel>Dateien anhängen</FormLabel>
          <FormControl>
            <div className="space-y-4">
              {existingFiles && existingFiles.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {existingFiles.map((url, index) => (
                    <div key={index} className="relative group">
                      {isImage(url) ? (
                        <img
                          src={url}
                          alt={`Uploaded file ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-muted rounded-lg border">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => onDeleteFile?.(url)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

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
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
