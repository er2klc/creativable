import { supabase } from "@/integrations/supabase/client";
import { DocumentSection } from "../DocumentSection";

interface DocumentManagerProps {
  existingFiles?: Array<{
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
  }>;
  isAdmin?: boolean;
  onDocumentDeleted?: () => Promise<void>;
}

export const DocumentManager = ({ 
  existingFiles = [], 
  isAdmin = false,
  onDocumentDeleted 
}: DocumentManagerProps) => {
  return (
    <div className="col-span-4">
      <DocumentSection
        documents={existingFiles?.map(file => ({
          id: file.id,
          name: file.file_name,
          url: supabase.storage.from('elevate-documents').getPublicUrl(file.file_path).data.publicUrl,
          file_path: file.file_path
        })) || []}
        isAdmin={isAdmin}
        onDocumentDeleted={onDocumentDeleted}
      />
    </div>
  );
};