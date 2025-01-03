import { supabase } from "@/integrations/supabase/client";
import { DocumentSection } from "../DocumentSection";

interface DocumentManagerProps {
  existingFiles?: Array<{
    file_name: string;
    file_path: string;
  }>;
}

export const DocumentManager = ({ existingFiles = [] }: DocumentManagerProps) => {
  return (
    <div className="col-span-4">
      <DocumentSection
        documents={existingFiles?.map(file => ({
          name: file.file_name,
          url: supabase.storage.from('elevate-documents').getPublicUrl(file.file_path).data.publicUrl
        })) || []}
      />
    </div>
  );
};