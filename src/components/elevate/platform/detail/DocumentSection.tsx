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
              asChild
            >
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {doc.name}
              </a>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};