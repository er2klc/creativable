import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    name: string;
    url: string;
    file_type?: string;
  };
}

export const DocumentPreview = ({ open, onOpenChange, document }: DocumentPreviewProps) => {
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
      document.name.match(/\.(xlsx|xls|csv)$/)
    ) {
      return (
        <div className="flex flex-col h-[80vh]">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-sm text-yellow-700">
              Excel-Dateien können nur heruntergeladen werden. 
              Bitte laden Sie die Datei herunter, um sie anzuzeigen oder zu bearbeiten.
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <FileSpreadsheet className="h-16 w-16 text-green-600 mb-4" />
            <p className="text-lg font-medium mb-2">{document.name}</p>
            <p className="text-muted-foreground mb-4">Excel-Datei</p>
            <Button asChild>
              <a href={document.url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Herunterladen
              </a>
            </Button>
          </div>
        </div>
      );
    } else if (fileType?.match(/^(doc|docx)$/) || fileType?.includes('word')) {
      return (
        <div className="flex flex-col h-[80vh]">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-sm text-yellow-700">
              Word-Dokumente können nur heruntergeladen werden. 
              Bitte laden Sie die Datei herunter, um sie anzuzeigen oder zu bearbeiten.
            </p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <FileText className="h-16 w-16 text-blue-600 mb-4" />
            <p className="text-lg font-medium mb-2">{document.name}</p>
            <p className="text-muted-foreground mb-4">Word-Dokument</p>
            <Button asChild>
              <a href={document.url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Herunterladen
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