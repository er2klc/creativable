import { FileText, FileSpreadsheet, FilePdf } from "lucide-react";

interface Document {
  name: string;
  url: string;
}

interface LearningDocumentsProps {
  documents: Document[];
}

export const LearningDocuments = ({ documents }: LearningDocumentsProps) => {
  if (!documents || documents.length === 0) return null;

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="h-5 w-5" />;
      case 'pdf':
        return <FilePdf className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Lerndokumente</h3>
      <div className="grid gap-2">
        {documents.map((doc, index) => (
          <a
            key={index}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            {getFileIcon(doc.name)}
            <span className="text-sm text-muted-foreground">{doc.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
};