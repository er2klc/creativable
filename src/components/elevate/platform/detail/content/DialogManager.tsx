import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { UnitCreation } from "../UnitCreation";
import { EditUnitDialog } from "../EditUnitDialog";

interface DialogManagerProps {
  platform: any;
  sortedSubmodules: any[];
  refetch: () => Promise<void>;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  activeUnit: any;
}

export const DialogManager = ({
  platform,
  sortedSubmodules,
  refetch,
  isDialogOpen,
  setIsDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  activeUnit
}: DialogManagerProps) => {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <>
      <UnitCreation
        platform={platform}
        sortedSubmodules={sortedSubmodules}
        refetch={refetch}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />

      {activeUnit && (
        <EditUnitDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title={activeUnit.title}
          description={activeUnit.description || ""}
          videoUrl={activeUnit.video_url || ""}
          onUpdate={async (data) => {
            try {
              const { error } = await supabase
                .from('elevate_lerninhalte')
                .update({
                  title: data.title,
                  description: data.description,
                  video_url: data.videoUrl
                })
                .eq('id', activeUnit.id);

              if (error) throw error;
              await refetch();
              setIsEditDialogOpen(false);
              toast.success("Lerneinheit erfolgreich aktualisiert");
            } catch (error) {
              console.error('Error updating learning unit:', error);
              toast.error("Fehler beim Aktualisieren der Lerneinheit");
            }
          }}
          existingFiles={[]}
          onFileRemove={() => {}}
          onFilesSelected={setFiles}
          files={files}
          id={activeUnit.id}
        />
      )}
    </>
  );
};