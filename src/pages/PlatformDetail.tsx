import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PlatformDetail = () => {
  const { moduleSlug } = useParams();
  const user = useUser();

  const { data: platform, isLoading } = useQuery({
    queryKey: ['platform', moduleSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elevate_platforms')
        .select(`
          *,
          elevate_submodules (
            id,
            title,
            description,
            video_url,
            submodule_order
          )
        `)
        .eq('slug', moduleSlug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!moduleSlug && !!user
  });

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

  const sortedSubmodules = platform.elevate_submodules?.sort(
    (a, b) => (a.submodule_order || 0) - (b.submodule_order || 0)
  ) || [];

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
              <TabsTrigger key={submodule.id} value={submodule.id}>
                {submodule.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {sortedSubmodules.map((submodule) => (
            <TabsContent key={submodule.id} value={submodule.id} className="mt-6">
              <div className="bg-card p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4">{submodule.title}</h3>
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