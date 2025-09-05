
import { useState } from "react";
import { FileText, File, FileSpreadsheet, Trash2, Plus, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocumentPreview } from "./DocumentPreview";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { Label } from "@/components/ui/label";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  preview_file_path: string | null;
}

interface DocumentSectionProps {
  documents: Document[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
  lerninhalteId: string;
}

export const DocumentSection = ({ documents, isAdmin, onDelete, lerninhalteId }: DocumentSectionProps) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('elevate_lerninhalte_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success("Dokument erfolgreich gelöscht");
      
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error("Fehler beim Löschen des Dokuments");
    }
  };

  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return <FileText className="h-4 w-4" />;

    switch (fileType.toLowerCase()) {
      case 'application/pdf':
        return <File className="h-4 w-4 text-red-600" />;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Wenn keine Dokumente vorhanden sind und der User kein Admin ist, zeigen wir nichts an
  if (!isAdmin && documents.length === 0) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <Label className="flex items-center gap-2 text-lg font-semibold">
          <Files className="h-5 w-5" />
          Dateien
        </Label>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUploadDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Dokument hinzufügen
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-all duration-200"
          >
            <button
              onClick={() => setSelectedDocument(doc)}
              className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 flex-1"
            >
              {getFileIcon(doc.file_type)}
              <span className="truncate">{doc.file_name}</span>
            </button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(doc.id)}
                className="ml-2"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {selectedDocument && (
        <DocumentPreview
          document={{
            name: selectedDocument.file_name,
            url: supabase.storage.from('elevate-documents').getPublicUrl(selectedDocument.file_path).data.publicUrl,
            file_type: selectedDocument.file_type,
            preview_url: selectedDocument.preview_file_path 
              ? supabase.storage.from('elevate-documents').getPublicUrl(selectedDocument.preview_file_path).data.publicUrl 
              : undefined
          }}
          open={!!selectedDocument}
          onOpenChange={(open) => !open && setSelectedDocument(null)}
        />
      )}

      {isAdmin && (
        <DocumentUploadDialog
          open={showUploadDialog}
          onOpenChange={setShowUploadDialog}
          lerninhalteId={lerninhalteId}
          onSuccess={() => {
            if (onDelete) {
              onDelete("refresh");
            }
          }}
        />
      )}
    </div>
  );
};
