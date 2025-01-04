import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dokumente</h3>
      <div className="space-y-2">
        {documents.map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <button
              onClick={() => setSelectedDocument(doc)}
              className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
            >
              <FileText className="h-4 w-4" />
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