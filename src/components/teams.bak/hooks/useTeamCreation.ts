import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useTeamCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();
  const queryClient = useQueryClient();

  const createTeam = async (name: string, description: string) => {
    if (!user) {
      toast.error("Sie müssen angemeldet sein, um ein Team zu erstellen");
      return null;
    }

    setIsLoading(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      const { data: team, error } = await supabase
        .from("teams")
        .insert({
          name,
          description,
          created_by: user.id,
          slug
        })
        .select()
        .single();

      if (error) throw error;

      // Create team member entry for creator
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: "owner"
        });

      if (memberError) throw memberError;

      await queryClient.invalidateQueries({ queryKey: ["teams"] });
      
      toast.success("Team erfolgreich erstellt!");
      return team;
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast.error(error.message || "Fehler beim Erstellen des Teams");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTeam,
    isLoading
  };
}