import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";

const PlatformDetail = () => {
  const { platformSlug } = useParams();
  const user = useUser();

  const { data: platform, isLoading } = useQuery({
    queryKey: ['platform', platformSlug],
    queryFn: async () => {
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
        .eq('name', platformSlug?.split('-').join(' '))
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!platformSlug && !!user
  });

  if (isLoading) {
    return <div>Laden...</div>;
  }

  if (!platform) {
    return <div>Modul nicht gefunden</div>;
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