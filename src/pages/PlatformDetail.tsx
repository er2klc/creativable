import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { PlatformHeader } from "@/components/elevate/platform/detail/PlatformHeader";
import { LearningUnitTabs } from "@/components/elevate/platform/detail/LearningUnitTabs";
import { CreateUnitDialog } from "@/components/elevate/platform/detail/CreateUnitDialog";
import { LearningUnitContent } from "@/components/elevate/platform/detail/LearningUnitContent";
import { useLearningProgress } from "@/hooks/use-learning-progress";

const PlatformDetail = () => {
  const { moduleSlug } = useParams();
  const user = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const { isCompleted, markAsCompleted } = useLearningProgress();

  const { data: platform, isLoading, refetch } = useQuery({
    queryKey: ['platform', moduleSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elevate_platforms')
        .select(`
          *,
          elevate_modules!elevate_modules_platform_id_fkey (
            id,
            title,
            description,
            elevate_lerninhalte!elevate_lerninhalte_module_id_fkey (
              id,
              title,
              description,
              video_url,
              submodule_order
            )
          )
        `)
        .eq('slug', moduleSlug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching platform:', error);
        throw error;
      }
      return data;
    },
    enabled: !!moduleSlug && !!user
  });

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
          created_by: user?.id,
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
            created_by: user?.id
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!platform) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Modul nicht gefunden</h1>
          <p className="mt-2 text-gray-600">
            Das von Ihnen gesuchte Modul konnte nicht gefunden werden.
          </p>
        </div>
      </div>
    );
  }

  const sortedSubmodules = platform.elevate_modules
    ?.flatMap(module => module.elevate_lerninhalte || [])
    .sort((a, b) => (a.submodule_order || 0) - (b.submodule_order || 0)) || [];

  const completedCount = sortedSubmodules.filter(submodule => 
    isCompleted(submodule.id)
  ).length;

  const isAdmin = user?.id === platform.created_by;

  const handleVideoProgress = async (lerninhalteId: string, progress: number) => {
    setVideoProgress(prev => ({
      ...prev,
      [lerninhalteId]: progress
    }));

    if (progress >= 95 && !isCompleted(lerninhalteId)) {
      await markAsCompleted(lerninhalteId);
    }

    localStorage.setItem(`video-progress-${lerninhalteId}`, progress.toString());
  };

  const handleUnitDeleted = async () => {
    await refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8">
        <PlatformHeader
          name={platform.name}
          completedCount={completedCount}
          totalCount={sortedSubmodules.length}
          isAdmin={isAdmin}
          onCreateUnit={() => setIsDialogOpen(true)}
        />

        {sortedSubmodules.length === 0 ? (
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-semibold mb-2">Keine Lerneinheiten verfügbar</h3>
            <p className="text-muted-foreground">
              Für dieses Modul wurden noch keine Lerneinheiten erstellt.
            </p>
          </div>
        ) : (
          <Tabs defaultValue={sortedSubmodules[0]?.id} className="w-full">
            <LearningUnitTabs
              units={sortedSubmodules.map(unit => ({
                id: unit.id,
                title: unit.title,
                completed: isCompleted(unit.id)
              }))}
              activeUnit={sortedSubmodules[0]?.id}
              onUnitChange={() => {}}
              isAdmin={isAdmin}
              onUnitDeleted={handleUnitDeleted}
              onCreateUnit={() => setIsDialogOpen(true)}
            />
            {sortedSubmodules.map((submodule) => (
              <TabsContent key={submodule.id} value={submodule.id}>
                <LearningUnitContent
                  title={submodule.title}
                  description={submodule.description}
                  videoUrl={submodule.video_url}
                  isCompleted={isCompleted(submodule.id)}
                  onComplete={() => markAsCompleted(submodule.id)}
                  onVideoProgress={(progress) => handleVideoProgress(submodule.id, progress)}
                  savedProgress={parseFloat(localStorage.getItem(`video-progress-${submodule.id}`) || '0')}
                  isAdmin={isAdmin}
                  onDelete={handleUnitDeleted}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}

        <CreateUnitDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleCreateUnit}
        />
      </div>
    </div>
  );
};

export default PlatformDetail;