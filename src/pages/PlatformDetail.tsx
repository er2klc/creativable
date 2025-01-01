import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Building2, Video, FileText } from "lucide-react";

const PlatformDetail = () => {
  const { platformSlug } = useParams();
  const navigate = useNavigate();
  const user = useUser();
  const [platformId, setPlatformId] = useState<string | null>(null);

  const { data: platform, isLoading } = useQuery({
    queryKey: ['platform', platformId],
    queryFn: async () => {
      if (!platformId || !user?.id) return null;

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
          elevate_team_access!inner(
            team_id,
            teams(*)
          )
        `)
        .eq('id', platformId)
        .or(`created_by.eq.${user.id},id.in.(
          select platform_id from elevate_team_access eta 
          join team_members tm on tm.team_id = eta.team_id 
          where tm.user_id = '${user.id}'
        )`)
        .single();

      if (error) {
        console.error('Error fetching platform:', error);
        toast.error("Fehler beim Laden der Plattform");
        navigate('/elevate');
        return null;
      }

      return data;
    },
    enabled: !!platformId && !!user?.id,
  });

  useEffect(() => {
    const fetchPlatformId = async () => {
      if (!platformSlug || !user?.id) return;

      try {
        const { data: platforms, error } = await supabase
          .from('elevate_platforms')
          .select('id, name')
          .or(`created_by.eq.${user.id},id.in.(
            select platform_id from elevate_team_access eta 
            join team_members tm on tm.team_id = eta.team_id 
            where tm.user_id = '${user.id}'
          )`);

        if (error) throw error;

        const platform = platforms.find(p => {
          const slug = p.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          return slug === platformSlug;
        });

        if (platform) {
          setPlatformId(platform.id);
        } else {
          toast.error("Plattform nicht gefunden");
          navigate('/elevate');
        }
      } catch (error) {
        console.error('Error fetching platform:', error);
        toast.error("Fehler beim Laden der Plattform");
        navigate('/elevate');
      }
    };

    fetchPlatformId();
  }, [platformSlug, navigate, user?.id]);

  if (isLoading || !platform) {
    return <div>Loading...</div>;
  }

  const progress = 30; // This should be calculated based on completed modules

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">{platform.name}</h1>
        </div>
        {platform.description && (
          <p className="text-muted-foreground">{platform.description}</p>
        )}
        <div className="max-w-xl space-y-1">
          <div className="flex justify-between text-sm">
            <span>Gesamtfortschritt</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      <div className="grid gap-6">
        {platform.elevate_modules?.sort((a, b) => a.order_index - b.order_index).map((module) => (
          <Card key={module.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                {module.type === 'video' ? (
                  <Video className="h-6 w-6 text-primary" />
                ) : (
                  <FileText className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="font-semibold">{module.title}</h3>
                <p className="text-sm text-muted-foreground">{module.description}</p>
                <Progress value={0} className="h-2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlatformDetail;