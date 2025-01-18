import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { TeamListView } from "@/components/teams/TeamListView";

const Unity = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: teams, error: userTeamsError } = profile?.is_super_admin 
        ? await supabase.from('teams').select('*').order('order_index', { ascending: true })
        : await supabase.rpc('get_user_teams', { uid: user.id });

      if (userTeamsError) {
        console.error("Error loading teams:", userTeamsError);
        toast.error("Fehler beim Laden der Teams");
        return [];
      }

      return teams || [];
    },
    enabled: !!user?.id && !!profile,
  });

  useEffect(() => {
    const teamId = searchParams.get('team');
    if (teamId) {
      navigate(`/unity/team/${teamId}`);
    }
  }, [searchParams, navigate]);

  return (
    <div className="container mx-auto py-6">
      <TeamListView teams={teams} isLoading={isLoading} />
    </div>
  );
};

export default Unity;