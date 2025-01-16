import { DocumentSection } from "../DocumentSection";
import { supabase } from "@/integrations/supabase/client";

interface DocumentManagerProps {
  existingFiles?: Array<{
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    preview_file_path: string | null;
  }>;
  isAdmin?: boolean;
  onDocumentDeleted?: () => Promise<void>;
  onAddDocument?: () => void;
}

export const DocumentManager = ({ 
  existingFiles = [], 
  isAdmin = false,
  onDocumentDeleted,
  onAddDocument
}: DocumentManagerProps) => {
  return (
    <div className="col-span-4">
      <DocumentSection
        documents={existingFiles}
        isAdmin={isAdmin}
        onDelete={onDocumentDeleted}
      />
    </div>
  );
};