import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PlatformHeader } from "./content/PlatformHeader";
import { PlatformTabs } from "./content/PlatformTabs";
import { DialogManager } from "./content/DialogManager";
import { EmptyState } from "./EmptyState";

interface PlatformContentProps {
  platform: any;
  sortedSubmodules: any[];
  isAdmin: boolean;
  activeUnitId: string;
  handleUnitChange: (unitId: string) => void;
  isCompleted: (id: string) => boolean;
  markAsCompleted: (id: string, completed?: boolean) => Promise<void>;
  handleVideoProgress: (lerninhalteId: string, progress: number) => void;
  refetch: () => Promise<any>;
}

export const PlatformContent = ({
  platform,
  sortedSubmodules,
  isAdmin,
  activeUnitId,
  handleUnitChange,
  isCompleted,
  markAsCompleted,
  handleVideoProgress,
  refetch,
}: PlatformContentProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  const activeUnit = sortedSubmodules.find(unit => unit.id === activeUnitId);
  const completedCount = sortedSubmodules.filter(unit => isCompleted(unit.id)).length;
  const progress = (completedCount / sortedSubmodules.length) * 100;

  if (sortedSubmodules.length === 0) {
    return (
      <EmptyState 
        isAdmin={isAdmin} 
        onCreateUnit={async (data) => {
          await handleCreateUnit(
            platform, 
            sortedSubmodules, 
            refetch, 
            setIsDialogOpen,
            data
          );
        }} 
      />
    );
  }

  const handleDeleteUnit = async () => {
    try {
      const { error: notesError } = await supabase
        .from('elevate_lerninhalte_notes')
        .delete()
        .eq('lerninhalte_id', activeUnitId);

      if (notesError) throw notesError;

      const { error: docsError } = await supabase
        .from('elevate_lerninhalte_documents')
        .delete()
        .eq('lerninhalte_id', activeUnitId);

      if (docsError) throw docsError;

      const { error } = await supabase
        .from('elevate_lerninhalte')
        .delete()
        .eq('id', activeUnitId);

      if (error) throw error;

      await refetch();
      toast.success("Lerneinheit erfolgreich gelöscht");
    } catch (error) {
      console.error('Error deleting learning unit:', error);
      toast.error("Fehler beim Löschen der Lerneinheit");
    }
  };

  return (
    <>
      <PlatformHeader
        platform={platform}
        activeUnit={activeUnit}
        isAdmin={isAdmin}
        isCompleted={isCompleted}
        markAsCompleted={markAsCompleted}
        handleDeleteUnit={handleDeleteUnit}
        setIsEditDialogOpen={setIsEditDialogOpen}
        progress={progress}
        videoDuration={videoDuration}
        documentsCount={2}
      />

      <div className="bg-gray-50 rounded-lg">
        <PlatformTabs
          sortedSubmodules={sortedSubmodules}
          activeUnitId={activeUnitId}
          handleUnitChange={handleUnitChange}
          isAdmin={isAdmin}
          setIsDialogOpen={setIsDialogOpen}
          isCompleted={isCompleted}
          markAsCompleted={markAsCompleted}
          handleVideoProgress={handleVideoProgress}
          platform={platform}
          handleDeleteUnit={handleDeleteUnit}
          refetch={refetch}
          setIsEditDialogOpen={setIsEditDialogOpen}
          progress={progress}
        />
      </div>

      <DialogManager
        platform={platform}
        sortedSubmodules={sortedSubmodules}
        refetch={refetch}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        activeUnit={activeUnit}
      />
    </>
  );
};