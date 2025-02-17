
import { DocumentSection } from "../DocumentSection";

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
  lerninhalteId: string;
}

export const DocumentManager = ({ 
  existingFiles = [], 
  isAdmin = false,
  onDocumentDeleted,
  lerninhalteId
}: DocumentManagerProps) => {
  return (
    <div className="col-span-4">
      <DocumentSection
        documents={existingFiles}
        isAdmin={isAdmin}
        onDelete={onDocumentDeleted}
        lerninhalteId={lerninhalteId}
      />
    </div>
  );
};
