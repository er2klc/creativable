import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    name: string;
    url: string;
    file_type?: string;
    file_path?: string;
  };
}

export const DocumentPreview = ({ open, onOpenChange, document }: DocumentPreviewProps) => {
  const [isConverting, setIsConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleConversion = async (filePath: string, fileType: string) => {
    setIsConverting(true);
    try {
      const { data, error } = await supabase.functions.invoke('convert-to-pdf', {
        body: { filePath, fileType }
      });

      if (error) throw error;
      setPdfUrl(data.publicUrl);
    } catch (error) {
      console.error('Error converting file:', error);
      toast.error('Fehler bei der Konvertierung der Datei');
    } finally {
      setIsConverting(false);
    }
  };

  const renderPreview = () => {
    const fileType = document.file_type?.toLowerCase() || document.name.split('.').pop()?.toLowerCase();

    if (fileType?.includes('pdf')) {
      return (
        <div className="w-full h-[80vh]">
          <iframe
            src={`${document.url}#toolbar=0&view=FitH`}
            className="w-full h-full"
            title={document.name}
          />
        </div>
      );
    } else if (fileType?.match(/^(jpg|jpeg|png|gif|webp)$/)) {
      return (
        <div className="flex justify-center items-center h-[80vh] overflow-auto">
          <img
            src={document.url}
            alt={document.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    } else if (
      fileType?.includes('sheet') ||
      fileType?.includes('excel') ||
      fileType?.match(/^(xlsx|xls|csv)$/) ||
      document.name.match(/\.(xlsx|xls|csv)$/) ||
      fileType?.match(/^(doc|docx)$/) ||
      fileType?.includes('word')
    ) {
      if (isConverting) {
        return (
          <div className="flex flex-col items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Dokument wird konvertiert...</p>
          </div>
        );
      }

      if (pdfUrl) {
        return (
          <div className="w-full h-[80vh]">
            <iframe
              src={`${pdfUrl}#toolbar=0&view=FitH`}
              className="w-full h-full"
              title={document.name}
            />
          </div>
        );
      }

      return (
        <div className="flex flex-col h-[80vh]">
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            {fileType?.includes('excel') || fileType?.match(/^(xlsx|xls|csv)$/) ? (
              <FileSpreadsheet className="h-16 w-16 text-green-600 mb-4" />
            ) : (
              <FileText className="h-16 w-16 text-blue-600 mb-4" />
            )}
            <p className="text-lg font-medium mb-2">{document.name}</p>
            <Button 
              onClick={() => handleConversion(document.file_path || '', fileType || '')}
              className="mb-4"
            >
              Als PDF anzeigen
            </Button>
            <Button asChild variant="outline">
              <a href={document.url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Original herunterladen
              </a>
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <p className="text-muted-foreground">Vorschau nicht verfügbar für {document.name}</p>
          <Button asChild>
            <a href={document.url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4 mr-2" />
              Herunterladen
            </a>
          </Button>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-0" hideClose>
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{document.name}</h3>
          <Button asChild variant="outline" size="sm">
            <a href={document.url} download target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        </div>
        <div className="p-4">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
