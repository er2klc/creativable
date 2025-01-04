import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { DocumentManager } from "./DocumentManager";

interface DescriptionSectionProps {
  title: string;
  description: string;
  existingFiles: any[];
  isAdmin: boolean;
  onDocumentDeleted: () => void | Promise<void>;  // Updated type to accept both void and Promise<void>
  onEdit: () => void;
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
    <div className="col-span-8 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <div 
            className="text-sm text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
      <DocumentManager
        existingFiles={existingFiles}
        isAdmin={isAdmin}
        onDocumentDeleted={onDocumentDeleted}
        onAddDocument={onEdit}
      />
    </div>
  );
};