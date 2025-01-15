import { useParams } from "react-router-dom";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useLearningProgress } from "@/hooks/use-learning-progress";
import { PlatformContent } from "@/components/elevate/platform/detail/PlatformContent";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PlatformDetailWrapper = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PlatformDetailContent />
    </QueryClientProvider>
  );
};

const PlatformDetailContent = () => {
  const { platformSlug } = useParams();
  const user = useUser();
  const [activeUnitId, setActiveUnitId] = useState<string>('');
  const { isCompleted, markAsCompleted } = useLearningProgress();
  const [videoProgressMap, setVideoProgressMap] = useState<Record<string, number>>({});

  const { data: platform, isLoading, refetch } = useQuery({
    queryKey: ['platform', platformSlug],
    queryFn: async () => {
      console.log("Fetching platform with slug:", platformSlug);
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
        .eq('slug', platformSlug)
        .single();

      if (error) {
        console.error("Error fetching platform:", error);
        throw error;
      }
      
      console.log("Platform data:", data);
      return data;
    },
    enabled: !!platformSlug && !!user
  });

  const sortedSubmodules = platform?.elevate_modules
    ?.flatMap(module => module.elevate_lerninhalte || [])
    .sort((a, b) => (a.submodule_order || 0) - (b.submodule_order || 0)) || [];

  if (sortedSubmodules.length > 0 && !activeUnitId) {
    setActiveUnitId(sortedSubmodules[0].id);
  }

  const isAdmin = user?.id === platform?.created_by;

  const handleUnitChange = (unitId: string) => {
    if (unitId === 'new') {
      return;
    }
    setActiveUnitId(unitId);
  };

  const handleVideoProgress = async (lerninhalteId: string, progress: number) => {
    setVideoProgressMap(prev => ({
      ...prev,
      [lerninhalteId]: progress
    }));

    if (progress >= 95 && !isCompleted(lerninhalteId)) {
      await markAsCompleted(lerninhalteId);
    }

    localStorage.setItem(`video-progress-${lerninhalteId}`, progress.toString());
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <PlatformContent
          platform={platform}
          sortedSubmodules={sortedSubmodules}
          isAdmin={isAdmin}
          activeUnitId={activeUnitId}
          handleUnitChange={handleUnitChange}
          isCompleted={isCompleted}
          markAsCompleted={markAsCompleted}
          handleVideoProgress={handleVideoProgress}
          refetch={refetch}
        />
      </div>
    </div>
  );
};

export default PlatformDetailWrapper;