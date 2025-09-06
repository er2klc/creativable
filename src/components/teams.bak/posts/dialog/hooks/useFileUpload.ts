
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFileUpload = (teamId: string) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (files: FileList | null): Promise<string[]> => {
    if (!files || files.length === 0) return [];
    
    const fileUrls: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${teamId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('team-files')
        .upload(filePath, file);
        
      if (uploadError) {
        toast.error(`Fehler beim Hochladen von ${file.name}`);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('team-files')
        .getPublicUrl(filePath);
        
      fileUrls.push(publicUrl);
    }
    
    return fileUrls;
  };

  return {
    isUploading,
    setIsUploading,
    handleFileUpload
  };
};
