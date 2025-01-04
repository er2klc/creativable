import { FileText, FileSpreadsheet, File } from "lucide-react";

interface ContentDescriptionProps {
  title: string;
  description: string;
  existingFiles?: Array<{ file_name: string; file_path: string }>;
}

export const ContentDescription = ({
  title,
  description,
  existingFiles = [],
}: ContentDescriptionProps) => {
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      case 'pdf':
        return <File className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-white h-full">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div 
        className="text-gray-600 max-w-none"
        dangerouslySetInnerHTML={{ __html: description }}
      />
    </div>
  );
};
