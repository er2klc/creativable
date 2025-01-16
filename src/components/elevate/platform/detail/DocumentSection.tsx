import { useState } from "react";
import { FileText, File, FileSpreadsheet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DocumentPreview } from "./DocumentPreview";

interface Document {
  name: string;
  url: string;
  id?: string;
  file_path?: string;
  file_type?: string;
  preview_file_path?: string;
  preview_url?: string;
}

interface DocumentSectionProps {
  documents: Document[];
  isAdmin?: boolean;
  onDocumentDeleted?: () => void;
}

export const DocumentSection = ({ documents, isAdmin = false, onDocumentDeleted }: DocumentSectionProps) => {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleDelete = async (document: Document) => {
    if (!document.id || !document.file_path) return;
    
    try {
      const { error: storageError } = await supabase.storage
        .from('elevate-documents')
        .remove([document.file_path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('elevate_lerninhalte_documents')
        .delete()
        .eq('id', document.id);

      if (dbError) throw dbError;

      toast.success('Dokument erfolgreich gelöscht');
      if (onDocumentDeleted) {
        onDocumentDeleted();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Fehler beim Löschen des Dokuments');
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

  // If no documents exist, don't render anything
  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Lerndokumente</h3>
      <div className="space-y-0.5">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <button
              onClick={() => {
                const previewUrl = doc.preview_file_path
                  ? supabase.storage.from('elevate-documents').getPublicUrl(doc.preview_file_path).data.publicUrl
                  : undefined;
                
                setSelectedDocument({
                  ...doc,
                  preview_url: previewUrl
                });
              }}
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
            >
              {getFileIcon(doc.file_type)}
              <span>{doc.name}</span>
            </button>
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(doc)}
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <DocumentPreview
        open={!!selectedDocument}
        onOpenChange={(open) => !open && setSelectedDocument(null)}
        document={selectedDocument || { name: "", url: "" }}
      />
    </div>
  );
};
