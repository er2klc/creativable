import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CreateUnitDialog } from "./CreateUnitDialog";

interface UnitCreationProps {
  platform: any;
  sortedSubmodules: any[];
  refetch: () => Promise<void>;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
}

export const UnitCreation = ({ 
  platform, 
  sortedSubmodules, 
  refetch,
  isDialogOpen,
  setIsDialogOpen
}: UnitCreationProps) => {
  const handleCreateUnit = async (data: {
    title: string;
    description: string;
    videoUrl: string;
    files: File[];
  }) => {
    try {
      const { data: lerninhalte, error: unitError } = await supabase
        .from('elevate_lerninhalte')
        .insert({
          module_id: platform?.elevate_modules?.[0]?.id,
          title: data.title,
          description: data.description,
          video_url: data.videoUrl,
          created_by: platform.created_by,
          submodule_order: sortedSubmodules.length
        })
        .select()
        .single();

      if (unitError) throw unitError;

      for (const file of data.files) {
        const filePath = `${lerninhalte.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('elevate-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: docError } = await supabase
          .from('elevate_lerninhalte_documents')
          .insert({
            lerninhalte_id: lerninhalte.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            created_by: platform.created_by
          });

        if (docError) throw docError;
      }

      toast.success("Neue Lerneinheit erfolgreich erstellt");
      setIsDialogOpen(false);
      await refetch();
    } catch (error) {
      console.error('Error creating learning unit:', error);
      toast.error("Fehler beim Erstellen der Lerneinheit");
    }
  };

  return (
    <CreateUnitDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      onSubmit={handleCreateUnit}
    />
  );
};