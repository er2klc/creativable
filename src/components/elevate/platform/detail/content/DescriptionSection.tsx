import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentDescription } from "../ContentDescription";

interface DescriptionSectionProps {
  title: string;
  description: string;
  existingFiles?: Array<{
    file_name: string;
    file_path: string;
  }>;
  isAdmin?: boolean;
  onDocumentDeleted?: () => Promise<void>;
  onEdit?: () => void;
}

export const DescriptionSection = ({
  title,
  description,
  existingFiles,
  isAdmin,
  onDocumentDeleted,
  onEdit,
}: DescriptionSectionProps) => {
  return (
    <div className="col-span-8 relative">
      {isAdmin && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="absolute top-2 right-2 text-primary hover:text-primary/80 hover:bg-primary/10"
        >
          <Edit className="h-4 w-4" />
        </Button>
      )}
      <ContentDescription
        title={title}
        description={description}
        existingFiles={existingFiles}
      />
    </div>
  );
};