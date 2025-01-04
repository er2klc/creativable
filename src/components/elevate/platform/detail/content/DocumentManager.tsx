import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Dokumente</h3>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddDocument}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
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