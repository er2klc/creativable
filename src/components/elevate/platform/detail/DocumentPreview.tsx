
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Image, File } from "lucide-react";

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    name: string;
    url: string;
    file_type?: string;
    preview_url?: string;
  };
}

export const DocumentPreview = ({ open, onOpenChange, document }: DocumentPreviewProps) => {
  const fileType = document.file_type?.toLowerCase() || document.name.split('.').pop()?.toLowerCase();
  const previewUrl = document.preview_url || document.url;

  // Verbesserte MIME-Type Erkennung
  const isImage = fileType?.includes('image') || 
                 fileType?.match(/^(jpg|jpeg|png|gif|webp)$/);
                 
  const isPdf = fileType?.includes('pdf') || 
                fileType === 'pdf' ||
                document.name.toLowerCase().endsWith('.pdf');
                
  const isOfficeDoc = fileType?.includes('spreadsheet') || 
                     fileType?.includes('word') || 
                     fileType?.includes('excel') ||
                     fileType?.match(/^(xlsx|xls|doc|docx)$/);

  const getFileIcon = () => {
    if (isImage) return <Image className="h-16 w-16 text-blue-600 mb-4" />;
    if (isPdf) return <File className="h-16 w-16 text-red-600 mb-4" />;
    if (fileType?.includes('sheet') || fileType?.match(/^(xlsx|xls|csv)$/)) {
      return <FileSpreadsheet className="h-16 w-16 text-green-600 mb-4" />;
    }
    return <FileText className="h-16 w-16 text-blue-600 mb-4" />;
  };

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex justify-center items-center h-[80vh] overflow-auto bg-gray-100 rounded-lg">
          <img
            src={previewUrl}
            alt={document.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }
    
    if (isPdf) {
      // Verbesserte PDF-Vorschau mit voller Funktionalität
      return (
        <div className="w-full h-[80vh]">
          <iframe
            src={previewUrl}
            className="w-full h-full rounded-lg"
            title={document.name}
          />
        </div>
      );
    }

    if (isOfficeDoc) {
      const encodedUrl = encodeURIComponent(previewUrl);
      const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`;
      
      return (
        <div className="w-full h-[80vh]">
          <iframe
            src={googleDocsViewerUrl}
            className="w-full h-full rounded-lg"
            title={document.name}
            frameBorder="0"
          />
        </div>
      );
    }

    // Fallback für andere Dateitypen
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        {getFileIcon()}
        <p className="text-lg font-medium mb-2">{document.name}</p>
        <Button asChild variant="outline">
          <a href={previewUrl} download target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-2" />
            Herunterladen
          </a>
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-0">
        <DialogTitle className="p-4 border-b">
          {document.name}
        </DialogTitle>
        <div className="absolute right-4 top-4">
          <Button asChild variant="outline" size="sm">
            <a href={previewUrl} download target="_blank" rel="noopener noreferrer">
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
