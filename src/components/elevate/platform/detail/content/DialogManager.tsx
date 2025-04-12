
import { useState } from "react";
import { EditUnitDialog } from "../dialog/EditUnitDialog";
import { CreateUnitDialog } from "../dialog/CreateUnitDialog";

// Define your interface for unit content
interface UnitContent {
  title: string;
  description: string;
  videoUrl: string;
}

interface DialogManagerProps {
  moduleId: string;
  onCreateUnit: (data: UnitContent) => Promise<void>;
  onUpdateUnit: (unitId: string, data: UnitContent) => Promise<void>;
  onDeleteUnit: (unitId: string) => Promise<void>;
  currentUnitId: string | null;
  currentUnitContent: UnitContent | null;
  existingFiles?: string[];
}

export const DialogManager = ({
  moduleId,
  onCreateUnit,
  onUpdateUnit,
  onDeleteUnit,
  currentUnitId,
  currentUnitContent,
  existingFiles = []
}: DialogManagerProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Function to handle opening the create dialog
  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  // Function to handle opening the edit dialog
  const openEditDialog = (unitId: string) => {
    setIsEditDialogOpen(true);
  };

  return (
    <>
      {/* Create Unit Dialog */}
      <CreateUnitDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateUnit={onCreateUnit}
        moduleId={moduleId}
      />

      {/* Edit Unit Dialog */}
      {currentUnitId && currentUnitContent && (
        <EditUnitDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title={currentUnitContent.title}
          description={currentUnitContent.description}
          videoUrl={currentUnitContent.videoUrl}
          onUpdate={(data) => onUpdateUnit(currentUnitId, data)}
          onDelete={() => onDeleteUnit(currentUnitId)}
          id={currentUnitId}
          existingFiles={existingFiles}
        />
      )}
    </>
  );
};
