import { FileText, FileSpreadsheet, File, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ContentDescriptionProps {
  title: string;
  description: string;
  existingFiles?: Array<{
    file_name: string;
    file_path: string;
  }>;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export const ContentDescription = ({
  title,
  description,
  existingFiles = [],
  isAdmin,
  onEdit,
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
    <Card className="p-6 relative">
      {isAdmin && onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="absolute top-2 right-2 text-primary hover:text-primary/80 hover:bg-primary/10"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: description }} 
      />
    </Card>
  );
};