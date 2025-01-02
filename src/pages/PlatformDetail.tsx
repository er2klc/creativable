import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { Skeleton } from "@/components/ui/skeleton";

const PlatformDetail = () => {
  const { platformSlug } = useParams();
  const user = useUser();

  const { data: platform, isLoading } = useQuery({
    queryKey: ['platform', platformSlug],
    queryFn: async () => {
      console.log('Searching for platform with slug:', platformSlug);
      
      const { data, error } = await supabase
        .from('elevate_platforms')
        .select(`
          *,
          elevate_modules (
            id,
            title,
            description,
            order_index
          ),
          elevate_team_access (
            team_id,
            teams (
              id,
              name
            )
          )
        `)
        .eq('slug', platformSlug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching platform:', error);
        throw error;
      }
      
      console.log('Found platform:', data);
      return data;
    },
    enabled: !!platformSlug && !!user
  });

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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{platform.name}</h1>
      </div>
      <p className="text-muted-foreground">{platform.description}</p>
      
      <div className="grid gap-6">
        {platform.elevate_modules?.map((module: any) => (
          <div 
            key={module.id} 
            className="bg-card p-6 rounded-lg shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
            <p className="text-muted-foreground">{module.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlatformDetail;