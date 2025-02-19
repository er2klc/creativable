
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MembersCard } from "@/components/teams/detail/snap-cards/MembersCard";

const TeamMembers = () => {
  const { teamSlug } = useParams();

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamSlug],
    queryFn: async () => {
      if (!teamSlug) throw new Error("No team slug provided");
      
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, slug')
        .eq('slug', teamSlug)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Team not found");

      return data;
    },
    enabled: !!teamSlug
  });

  if (isLoading) {
    return <div className="p-4">Lädt...</div>;
  }

  if (!team) {
    return <div className="p-4">Team nicht gefunden</div>;
  }

  return (
    <MembersCard 
      teamId={team.id} 
      teamSlug={team.slug}
    />
  );
};

export default TeamMembers;
