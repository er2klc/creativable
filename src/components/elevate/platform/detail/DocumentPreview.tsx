import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    id?: string;
    name: string;
    url: string;
    file_type?: string;
    preview_url?: string;
  };
  onDelete?: () => void;
}

export const DocumentPreview = ({ open, onOpenChange, document, onDelete }: DocumentPreviewProps) => {
  const fileType = document.file_type?.toLowerCase() || document.name.split('.').pop()?.toLowerCase();
  const previewUrl = document.preview_url || document.url;

  const isImage = fileType?.match(/^(jpg|jpeg|png|gif|webp)$/);

  const handleDelete = async () => {
    if (onDelete) {
      onDelete();
      onOpenChange(false);
    }
  };

  const renderPreview = () => {
    // Handle images with direct preview
    if (isImage) {
      return (
        <div className="flex justify-center items-center h-[80vh] overflow-auto">
          <img
            src={previewUrl}
            alt={document.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }
    // Handle Office documents (xlsx and docx)
    else if (fileType?.match(/^(xlsx|docx)$/)) {
      const encodedUrl = encodeURIComponent(previewUrl);
      const officePreviewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
      
      return (
        <div className="w-full h-[80vh]">
          <iframe
            src={officePreviewUrl}
            className="w-full h-full"
            title={document.name}
            frameBorder="0"
          />
        </div>
      );
    }
    // Handle PDFs
    else if (fileType?.includes('pdf')) {
      return (
        <div className="w-full h-[80vh]">
          <iframe
            src={previewUrl}
            className="w-full h-full"
            title={document.name}
          />
        </div>
      );
    }
    // Default download view for other file types
    else {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          {fileType?.includes('sheet') || fileType?.match(/^(xlsx|xls|csv)$/) ? (
            <FileSpreadsheet className="h-16 w-16 text-green-600 mb-4" />
          ) : (
            <FileText className="h-16 w-16 text-blue-600 mb-4" />
          )}
          <p className="text-lg font-medium mb-2">{document.name}</p>
          <Button asChild variant="outline">
            <a href={previewUrl} download target="_blank" rel="noopener noreferrer">
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
          <div className="flex gap-2">
            {onDelete && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <a href={previewUrl} download target="_blank" rel="noopener noreferrer">
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