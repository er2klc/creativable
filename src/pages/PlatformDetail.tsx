import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const PlatformDetail = () => {
  const { moduleSlug } = useParams();
  const user = useUser();

  const { data: platform, isLoading } = useQuery({
    queryKey: ['platform', moduleSlug],
    queryFn: async () => {
      console.log('Fetching platform data for slug:', moduleSlug);
      
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
      
      console.log('Fetched platform data:', data);
      return data;
    },
    enabled: !!moduleSlug && !!user
  });

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elevate_user_progress')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  const markAsCompleted = async (lerninhalteId: string) => {
    try {
      const { error } = await supabase
        .from('elevate_user_progress')
        .upsert({
          user_id: user?.id,
          lerninhalte_id: lerninhalteId,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success("Lerneinheit als erledigt markiert");
    } catch (error) {
      console.error('Error marking as completed:', error);
      toast.error("Fehler beim Markieren als erledigt");
    }
  };

  const isAdmin = platform?.created_by === user?.id;

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

  // Get all submodules from all modules and sort them
  const sortedSubmodules = platform.elevate_modules
    ?.flatMap(module => module.elevate_lerninhalte || [])
    .sort((a, b) => (a.submodule_order || 0) - (b.submodule_order || 0)) || [];

  console.log('Sorted submodules:', sortedSubmodules);

  const isCompleted = (lerninhalteId: string) => {
    return userProgress?.some(
      progress => progress.lerninhalte_id === lerninhalteId && progress.completed
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{platform.name}</h1>
        {isAdmin && (
          <Button onClick={() => console.log("Add new learning unit")}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Lerneinheit
          </Button>
        )}
      </div>
      
      <p className="text-muted-foreground">{platform.description}</p>

      {sortedSubmodules.length === 0 ? (
        <div className="bg-card p-6 rounded-lg shadow-lg text-center">
          <h3 className="text-xl font-semibold mb-2">Keine Lerneinheiten verfügbar</h3>
          <p className="text-muted-foreground">
            Für dieses Modul wurden noch keine Lerneinheiten erstellt.
          </p>
        </div>
      ) : (
        <Tabs defaultValue={sortedSubmodules[0]?.id} className="w-full">
          <TabsList className="w-full justify-start">
            {sortedSubmodules.map((submodule) => (
              <TabsTrigger 
                key={submodule.id} 
                value={submodule.id}
                className="flex items-center gap-2"
              >
                {submodule.title}
                {isCompleted(submodule.id) && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {sortedSubmodules.map((submodule) => (
            <TabsContent key={submodule.id} value={submodule.id} className="mt-6">
              <div className="bg-card p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{submodule.title}</h3>
                  <Button
                    variant={isCompleted(submodule.id) ? "secondary" : "default"}
                    onClick={() => markAsCompleted(submodule.id)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isCompleted(submodule.id) ? "Erledigt" : "Als erledigt markieren"}
                  </Button>
                </div>
                {submodule.video_url && (
                  <div className="aspect-video mb-4">
                    <iframe
                      src={submodule.video_url}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                )}
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {submodule.description}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default PlatformDetail;