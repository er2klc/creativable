import { useState } from "react";
import { EditUnitDialog } from "../dialog/EditUnitDialog";
import { CreateUnitDialog } from "../dialog/CreateUnitDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DialogManagerProps {
  platformId: string;
  onUnitCreated: () => void;
}

export const DialogManager = ({ platformId, onUnitCreated }: DialogManagerProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [unitData, setUnitData] = useState<{
    title: any;
    description: any;
    videoUrl: any;
  }>({
    title: "",
    description: "",
    videoUrl: "",
  });

  const handleEditClick = (unitId: string, title: string, description: string, videoUrl: string) => {
    setSelectedUnit(unitId);
    setUnitData({ title, description, videoUrl });
    setShowEditDialog(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Lerneinheit erstellen
        </Button>
      </div>

      <CreateUnitDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        platformId={platformId}
        onUnitCreated={onUnitCreated}
      />

      {selectedUnit && (
        <EditUnitDialog
          open={showEditDialog}
          onOpenChange={(open: boolean) => {
            setShowEditDialog(open);
            if (!open) {
              setSelectedUnit(null);
              setUnitData({ title: "", description: "", videoUrl: "" });
            }
          }}
          id={selectedUnit}
          platformId={platformId}
          title={unitData.title}
          description={unitData.description}
          videoUrl={unitData.videoUrl}
          onUpdate={async (data: { title: string; description: string; videoUrl: string }) => {
            // Handle update logic here
          }}
        />
      )}
    </>
  );
};
