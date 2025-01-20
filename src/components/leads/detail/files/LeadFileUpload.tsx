import { useState } from "react";
import { Upload, X, FileSpreadsheet, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface LeadFileUploadProps {
  leadId: string;
}

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
];

export const LeadFileUpload = ({ leadId }: LeadFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();
  const { user } = useAuth();

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      ALLOWED_FILE_TYPES.includes(file.type)
    );
    
    if (files.length === 0) {
      toast({
        title: settings?.language === "en" ? "Invalid file type" : "Ungültiger Dateityp",
        description: settings?.language === "en" 
          ? "Please upload JPG, PNG, PDF, CSV, Excel or Word files" 
          : "Bitte laden Sie JPG, PNG, PDF, CSV, Excel oder Word Dateien hoch",
        variant: "destructive"
      });
      return;
    }

    await Promise.all(files.map(file => handleFileUpload(file)));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => 
        ALLOWED_FILE_TYPES.includes(file.type)
      );
      
      if (files.length !== Array.from(e.target.files).length) {
        toast({
          title: settings?.language === "en" ? "Invalid file type" : "Ungültiger Dateityp",
          description: settings?.language === "en" 
            ? "Some files were not added because they are not supported. Allowed formats: JPG, PNG, PDF, CSV, Excel, Word" 
            : "Einige Dateien wurden nicht hinzugefügt, da sie nicht unterstützt werden. Erlaubte Formate: JPG, PNG, PDF, CSV, Excel, Word",
          variant: "destructive"
        });
      }
      
      Promise.all(files.map(file => handleFileUpload(file)));
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${leadId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('lead_files')
        .insert({
          lead_id: leadId,
          user_id: user.id,
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
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label 
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ease-in-out
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700'
            }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className={`w-8 h-8 mb-3 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">
                {settings?.language === "en" ? "Click" : "Klicken"}</span> {settings?.language === "en" ? "or drag files here" : "oder Dateien hierher ziehen"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG, PDF, CSV, Excel, Word
            </p>
          </div>
          <input
            type="file"
            className="hidden"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.csv,.xlsx,.xls,.doc,.docx"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
};