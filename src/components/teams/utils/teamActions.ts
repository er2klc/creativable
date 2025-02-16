
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const handleTeamDelete = async (teamId: string): Promise<boolean> => {
  try {
    console.log('Attempting to delete team with ID:', teamId);
    
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      console.error('Error in team delete:', error);
      if (error.message?.includes('policy')) {
        toast.error("Sie haben keine Berechtigung, dieses Team zu löschen");
      } else {
        toast.error("Fehler beim Löschen des Teams");
      }
      return false;
    }
    
    toast.success("Team erfolgreich gelöscht");
    return true;
  } catch (error) {
    console.error('Error in team delete:', error);
    toast.error("Fehler beim Löschen des Teams");
    return false;
  }
};

export const handleTeamLeave = async (teamId: string, userId: string): Promise<boolean> => {
  try {
    console.log('Attempting to leave team:', teamId, 'for user:', userId);
    
    // First check if the membership exists
    const { data: members, error: checkError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (checkError) {
      console.error('Error checking team membership:', checkError);
      toast.error("Fehler beim Verlassen des Teams");
      return false;
    }

    // If no membership exists, return early
    if (!members || members.length === 0) {
      console.log('No team membership found to delete');
      return false;
    }

    // Delete the membership
    const { error: deleteError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error in team leave:', deleteError);
      toast.error("Fehler beim Verlassen des Teams");
      return false;
    }

    toast.success("Team erfolgreich verlassen");
    return true;
    
  } catch (error) {
    console.error('Error in team leave:', error);
    toast.error("Fehler beim Verlassen des Teams");
    return false;
  }
};
