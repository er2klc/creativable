import { useQuery } from "@tanstack/react-query";
import { TeamCard } from "./TeamCard";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const TeamList = () => {
  const session = useSession();
  const navigate = useNavigate();

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data: teams, error } = await supabase
        .rpc('get_user_teams', {
          uid: session?.user?.id
        });

      if (error) throw error;
      return teams;
    },
    enabled: !!session?.user?.id,
  });

  const handleDelete = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from("teams")
        .delete()
        .eq("id", teamId);

      if (error) throw error;

      toast.success("Team erfolgreich gelöscht");
      navigate("/unity");
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.error("Fehler beim Löschen des Teams");
    }
  };

  const handleLeave = async (teamId: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", session?.user?.id);

      if (error) throw error;

      toast.success("Team erfolgreich verlassen");
      navigate("/unity");
    } catch (error) {
      console.error("Error leaving team:", error);
      toast.error("Fehler beim Verlassen des Teams");
    }
  };

  const handleCopyJoinCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Team-Code kopiert");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams?.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          onDelete={handleDelete}
          onLeave={handleLeave}
          onCopyJoinCode={handleCopyJoinCode}
        />
      ))}
    </div>
  );
};