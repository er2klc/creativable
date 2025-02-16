
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
    
    // First check if the member exists
    const { data: memberExists } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!memberExists) {
      console.log('No team membership found to delete');
      return false;
    }
    
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error in team leave:', error);
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
