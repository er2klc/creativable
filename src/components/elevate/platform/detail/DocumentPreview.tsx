import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, ZoomIn, ZoomOut } from "lucide-react";

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
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  const renderPreview = () => {
    const fileType = document.file_type?.toLowerCase() || document.name.split('.').pop()?.toLowerCase();

    if (fileType?.includes('pdf')) {
      return (
        <div className="w-full h-[80vh] overflow-hidden">
          <iframe
            src={`${document.url}#toolbar=0&view=FitH`}
            className="w-full h-full"
            title={document.name}
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              width: `${100 / scale}%`,
              height: `${100 / scale}%`
            }}
          />
        </div>
      );
    } else if (fileType?.match(/^(jpg|jpeg|png|gif|webp)$/)) {
      return (
        <div className="flex justify-center items-center h-[80vh] overflow-auto">
          <img
            src={document.url}
            alt={document.name}
            style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
          />
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <p className="text-muted-foreground">Vorschau nicht verfügbar</p>
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
      <DialogContent className="max-w-5xl w-full p-0">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{document.name}</h3>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={document.url} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
        <div className="p-4">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};