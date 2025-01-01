import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PlatformDetail = () => {
  const { platformSlug } = useParams();
  const navigate = useNavigate();
  const user = useUser();
  const [platformId, setPlatformId] = useState<string | null>(null);

  const { data: platform, isLoading } = useQuery({
    queryKey: ['platform', platformId],
    queryFn: async () => {
      if (!platformId) return null;

      const { data, error } = await supabase
        .from('elevate_platforms')
        .select('*')
        .eq('id', platformId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!platformId,
  });

  useEffect(() => {
    const fetchPlatformId = async () => {
      if (!platformSlug) return;

      // Get all platforms and find the one matching the slug
      const { data: platforms, error } = await supabase
        .from('elevate_platforms')
        .select('id, name');

      if (error) {
        console.error('Error fetching platform:', error);
        return;
      }

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
        navigate('/elevate');
      }
    };

    fetchPlatformId();
  }, [platformSlug, navigate]);

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