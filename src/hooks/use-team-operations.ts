import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSettings } from "./use-settings";

export const useTeamOperations = () => {
  const queryClient = useQueryClient();
  const { settings } = useSettings();

  const deleteTeam = async (teamId: string) => {
    try {
      // First, delete all team members
      const { error: membersError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId);

      if (membersError) {
        console.error('Error deleting team members:', membersError);
        toast.error(settings?.language === "en" 
          ? "Error deleting team members" 
          : "Fehler beim Löschen der Teammitglieder"
        );
        return;
      }

      // Then delete the team itself
      const { error: teamError } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (teamError) {
        console.error('Error deleting team:', teamError);
        if (teamError.message?.includes('policy')) {
          toast.error(settings?.language === "en"
            ? "You don't have permission to delete this team"
            : "Sie haben keine Berechtigung, dieses Team zu löschen"
          );
        } else {
          toast.error(settings?.language === "en" 
            ? "Error deleting team" 
            : "Fehler beim Löschen des Teams"
          );
        }
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success(settings?.language === "en" 
        ? "Team deleted successfully" 
        : "Team erfolgreich gelöscht"
      );
    } catch (error) {
      console.error('Error in deleteTeam:', error);
      toast.error(settings?.language === "en" 
        ? "Error deleting team" 
        : "Fehler beim Löschen des Teams"
      );
    }
  };

  const updateTeamOrder = async (teamId: string, direction: 'up' | 'down') => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({ order_index: direction === 'up' ? -1 : 1 })
        .eq('id', teamId);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      return true;
    } catch (error) {
      console.error('Error updating team order:', error);
      toast.error(settings?.language === "en" 
        ? "Error updating team order" 
        : "Fehler beim Aktualisieren der Team-Reihenfolge"
      );
      return false;
    }
  };

  return {
    deleteTeam,
    updateTeamOrder
  };
};