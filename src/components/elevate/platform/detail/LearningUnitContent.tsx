
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Eye, FileText, Film } from "lucide-react";
import { EditUnitDialog } from "./dialog/EditUnitDialog";
import { PlatformContent } from "./PlatformContent";

interface LearningUnitContentProps {
  unitId: string;
  title: string;
  description: string;
  videoUrl: string;
  documentUrl?: string;
  onUpdate: (data: { title: string; description: string; videoUrl: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  existingFiles?: string[];
}

export const LearningUnitContent = ({
  unitId,
  title,
  description,
  videoUrl,
  documentUrl,
  onUpdate,
  onDelete,
  existingFiles = []
}: LearningUnitContentProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <PlatformContent 
        id={unitId}
        moduleTitle=""
        title={title}
        description={description}
        videoUrl={videoUrl}
        documentUrl={documentUrl}
        isAdmin={true}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />

      <EditUnitDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        title={title}
        description={description}
        videoUrl={videoUrl}
        onUpdate={onUpdate}
        onDelete={onDelete}
        id={unitId}
        existingFiles={existingFiles}
      />
    </div>
  );
};
