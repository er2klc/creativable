import { ContentDescription } from "../ContentDescription";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";

interface DescriptionSectionProps {
  title: string;
  description: string;
  existingFiles?: Array<{
    file_name: string;
    file_path: string;
  }>;
  onEdit?: () => void;
  isAdmin?: boolean;
}

export const DescriptionSection = ({
  title,
  description,
  existingFiles,
  onEdit,
  isAdmin,
}: DescriptionSectionProps) => {
  return (
    <div className="col-span-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {isAdmin && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-muted-foreground hover:text-primary"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      <ContentDescription
        title={title}
        description={description}
        existingFiles={existingFiles}
      />
    </div>
  );
};