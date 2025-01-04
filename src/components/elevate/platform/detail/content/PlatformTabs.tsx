import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LearningUnitTabs } from "../LearningUnitTabs";
import { LearningUnitContent } from "../LearningUnitContent";

interface PlatformTabsProps {
  sortedSubmodules: any[];
  activeUnitId: string;
  handleUnitChange: (unitId: string) => void;
  isAdmin: boolean;
  setIsDialogOpen: (open: boolean) => void;
  isCompleted: (id: string) => boolean;
  markAsCompleted: (id: string, completed?: boolean) => Promise<void>;
  handleVideoProgress: (lerninhalteId: string, progress: number) => void;
  platform: any;
  handleDeleteUnit: () => Promise<void>;
  refetch: () => Promise<void>;
  setIsEditDialogOpen: (open: boolean) => void;
  progress: number;
}

export const PlatformTabs = ({
  sortedSubmodules,
  activeUnitId,
  handleUnitChange,
  isAdmin,
  setIsDialogOpen,
  isCompleted,
  markAsCompleted,
  handleVideoProgress,
  platform,
  handleDeleteUnit,
  refetch,
  setIsEditDialogOpen,
  progress
}: PlatformTabsProps) => {
  return (
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
        onEditUnit={() => setIsEditDialogOpen(true)}
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
            onDelete={handleDeleteUnit}
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
                setIsEditDialogOpen(false);
              } catch (error) {
                console.error('Error updating learning unit:', error);
                toast.error("Fehler beim Aktualisieren der Lerneinheit");
              }
            }}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};