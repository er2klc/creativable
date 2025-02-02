import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface FileCardProps {
  name?: string;
  type?: string;
  size?: number;
  path?: string;
}

export const FileCard = ({ name, type, size, path }: FileCardProps) => {
  return (
    <Card className="flex items-center gap-4 p-4">
      <FileText className="h-5 w-5 text-gray-500" />
      <div className="flex-1">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-gray-500">
          {type} - {size ? `${(size / 1024).toFixed(2)} KB` : "Unknown size"}
        </div>
      </div>
      {path && (
        <a href={path} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
          Download
        </a>
      )}
    </Card>
  );
};
