import { Tabs, TabsContent } from "@/components/ui/tabs";
import { LearningUnitTabs } from "./LearningUnitTabs";
import { LearningUnitContent } from "./LearningUnitContent";
import { LearningUnitHeader } from "./LearningUnitHeader";
import { Button } from "@/components/ui/button";
import { CreateUnitDialog } from "./CreateUnitDialog";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PlatformContentProps {
  platform: any;
  sortedSubmodules: any[];
  isAdmin: boolean;
  activeUnitId: string;
  handleUnitChange: (unitId: string) => void;
  isCompleted: (id: string) => boolean;
  markAsCompleted: (id: string, completed?: boolean) => Promise<void>;
  handleVideoProgress: (lerninhalteId: string, progress: number) => void;
  refetch: () => Promise<void>;
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

  const handleUnitDeleted = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error refetching after unit deletion:', error);
    }
  };

  if (sortedSubmodules.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg text-center space-y-4">
        <h3 className="text-xl font-semibold mb-2">Keine Lerneinheiten verfügbar</h3>
        <p className="text-muted-foreground">
          Für dieses Modul wurden noch keine Lerneinheiten erstellt.
        </p>
        {isAdmin && (
          <Button onClick={() => setIsDialogOpen(true)} className="mt-4">
            Erste Lerneinheit erstellen
          </Button>
        )}
        <CreateUnitDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreateUnit}
        />
      </div>
    );
  }

  const activeUnit = sortedSubmodules.find(unit => unit.id === activeUnitId);
  const completedCount = sortedSubmodules.filter(unit => isCompleted(unit.id)).length;
  const progress = (completedCount / sortedSubmodules.length) * 100;

  return (
    <>
      {activeUnit && (
        <LearningUnitHeader
          moduleTitle={platform.name}
          title={activeUnit.title}
          isCompleted={isCompleted(activeUnit.id)}
          onComplete={() => markAsCompleted(activeUnit.id, !isCompleted(activeUnit.id))}
          isAdmin={isAdmin}
          onEdit={() => {/* Implement edit functionality */}}
          onDelete={() => {/* Implement delete functionality */}}
          videoDuration={0} // Add actual video duration
          documentsCount={0} // Add actual documents count
          progress={progress}
        />
      )}

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
        />

        {sortedSubmodules.map((submodule) => (
          <TabsContent key={submodule.id} value={submodule.id}>
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
              onDelete={handleUnitDeleted}
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

      <CreateUnitDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateUnit}
      />
    </>
  );
};