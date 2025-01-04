import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useState } from "react";

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

  const renderPreview = () => {
    if (fileType?.includes('pdf') || 
        (fileType?.includes('sheet') || fileType?.match(/^(xlsx|xls)$/)) && document.preview_url) {
      return (
        <div className="w-full h-[80vh]">
          <iframe
            src={`${previewUrl}#toolbar=0&view=FitH`}
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
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          {fileType?.includes('sheet') || fileType?.match(/^(xlsx|xls|csv)$/) ? (
            <FileSpreadsheet className="h-16 w-16 text-green-600 mb-4" />
          ) : (
            <FileText className="h-16 w-16 text-blue-600 mb-4" />
          )}
          <p className="text-lg font-medium mb-2">{document.name}</p>
          <Button asChild variant="outline">
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