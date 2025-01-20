import { useState } from "react";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface LeadFileUploadProps {
  leadId: string;
}

export const LeadFileUpload = ({ leadId }: LeadFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Create a properly structured file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${leadId}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create database entry
      const { error: dbError } = await supabase
        .from('lead_files')
        .insert({
          lead_id: leadId,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      toast({
        title: settings?.language === "en" ? "File uploaded" : "Datei hochgeladen",
        description: settings?.language === "en" 
          ? "The file has been uploaded successfully" 
          : "Die Datei wurde erfolgreich hochgeladen",
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: settings?.language === "en" ? "Upload failed" : "Upload fehlgeschlagen",
        description: settings?.language === "en"
          ? "There was an error uploading the file"
          : "Beim Hochladen der Datei ist ein Fehler aufgetreten",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
      <label
        htmlFor="file-upload"
        className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        <Upload className="h-4 w-4 mr-2" />
        {settings?.language === "en" ? "Upload File" : "Datei hochladen"}
      </label>
    </div>
  );
};