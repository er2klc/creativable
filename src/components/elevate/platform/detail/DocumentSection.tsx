import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Document {
  name: string;
  url: string;
}

interface DocumentSectionProps {
  documents: Document[];
}

export const DocumentSection = ({ documents }: DocumentSectionProps) => {
  if (documents.length === 0) return null;

  const handleDocumentClick = (url: string, name: string) => {
    // For PDFs and images, open in new tab
    if (url.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      window.open(url, '_blank');
    } else {
      // For other files, trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="font-semibold mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Lerndokumente
      </h4>
      <ul className="space-y-2">
        {documents.map((doc, index) => (
          <li key={index}>
            <Button
              variant="ghost"
              className="w-full justify-start text-primary hover:text-primary/80"
              onClick={() => handleDocumentClick(doc.url, doc.name)}
            >
              <FileText className="h-4 w-4 mr-2" />
              {doc.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};