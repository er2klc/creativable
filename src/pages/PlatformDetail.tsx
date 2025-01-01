import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  return (
    <div>
      <h1>{platform.name}</h1>
      {platform.description && <p>{platform.description}</p>}
    </div>
  );
};

export default PlatformDetail;