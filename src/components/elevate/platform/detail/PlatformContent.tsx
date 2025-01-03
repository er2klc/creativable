import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LearningUnitTabs } from "./LearningUnitTabs";
import { LearningUnitContent } from "./LearningUnitContent";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PlatformDetailHeader } from "./PlatformDetailHeader";
import { EmptyState } from "./EmptyState";
import { UnitCreation, handleCreateUnit } from "./UnitCreation";

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

  const activeUnit = sortedSubmodules.find(unit => unit.id === activeUnitId);
  const completedCount = sortedSubmodules.filter(unit => isCompleted(unit.id)).length;
  const progress = (completedCount / sortedSubmodules.length) * 100;

  if (sortedSubmodules.length === 0) {
    return <EmptyState 
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
    />;
  }

  const handleEditUnit = async () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteUnit = async () => {
    try {
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
      {activeUnit && (
        <PlatformDetailHeader
          moduleTitle={platform.name}
          title={activeUnit.title}
          isCompleted={isCompleted(activeUnit.id)}
          onComplete={() => markAsCompleted(activeUnit.id, !isCompleted(activeUnit.id))}
          isAdmin={isAdmin}
          onEdit={handleEditUnit}
          onDelete={handleDeleteUnit}
          videoDuration={0}
          documentsCount={0}
          progress={progress}
        />
      )}

      <div className="bg-gray-50 rounded-lg">
        <Tabs value={activeUnitId} onValueChange={handleUnitChange} className="w-full">
          <LearningUnitTabs
            units={sortedSubmodules.map(unit => ({
              id: unit.id,
              title: unit.title,
              completed: isCompleted(unit.id)
            }))}
            activeUnit={activeUnitId}
            onUnitChange={handleUnitChange}
            isAdmin={isAdmin}
            onCreateUnit={() => setIsDialogOpen(true)}
            progress={progress}
          />

          {sortedSubmodules.map((submodule) => (
            <TabsContent key={submodule.id} value={submodule.id} className="bg-white rounded-b-lg">
              <LearningUnitContent
                id={submodule.id}
                moduleTitle={platform.name}
                title={submodule.title}
                description={submodule.description}
                videoUrl={submodule.video_url}
                isCompleted={isCompleted(submodule.id)}
                onComplete={() => markAsCompleted(submodule.id, !isCompleted(submodule.id))}
                onVideoProgress={(progress) => handleVideoProgress(submodule.id, progress)}
                savedProgress={parseFloat(localStorage.getItem(`video-progress-${submodule.id}`) || '0')}
                isAdmin={isAdmin}
                onDelete={async () => {
                  try {
                    const { error } = await supabase
                      .from('elevate_lerninhalte')
                      .delete()
                      .eq('id', submodule.id);

                    if (error) throw error;
                    await refetch();
                    toast.success("Lerneinheit erfolgreich gelöscht");
                  } catch (error) {
                    console.error('Error deleting learning unit:', error);
                    toast.error("Fehler beim Löschen der Lerneinheit");
                  }
                }}
                onUpdate={async (data) => {
                  try {
                    const { error } = await supabase
                      .from('elevate_lerninhalte')
                      .update({
                        title: data.title,
                        description: data.description,
                        video_url: data.videoUrl
                      })
                      .eq('id', submodule.id);

                    if (error) throw error;
                    await refetch();
                    toast.success("Lerneinheit erfolgreich aktualisiert");
                  } catch (error) {
                    console.error('Error updating learning unit:', error);
                    toast.error("Fehler beim Aktualisieren der Lerneinheit");
                  }
                }}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <UnitCreation
        platform={platform}
        sortedSubmodules={sortedSubmodules}
        refetch={refetch}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </>
  );
};