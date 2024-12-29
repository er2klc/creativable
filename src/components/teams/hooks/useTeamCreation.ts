import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

interface TeamCreationProps {
  onSuccess: (joinCode: string) => void;
  onError: (error: Error) => void;
}

interface CreateTeamData {
  name: string;
  description: string;
  logoFile: File | null;
}

export const useTeamCreation = ({ onSuccess, onError }: TeamCreationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  const uploadLogo = async (teamId: string, logoFile: File): Promise<string | null> => {
    const fileExt = logoFile.name.split('.').pop();
    const filePath = `${teamId}/logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('team-logos')
      .upload(filePath, logoFile);

    if (uploadError) {
      console.error("Error uploading logo:", uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('team-logos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleCreate = async ({ name, description, logoFile }: CreateTeamData) => {
    if (!user) {
      throw new Error("Sie müssen eingeloggt sein, um ein Team zu erstellen");
    }

    if (!name.trim()) {
      throw new Error("Bitte geben Sie einen Team-Namen ein");
    }

    setIsLoading(true);

    try {
      const { data: teams, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: name.trim(),
          description: description.trim(),
          created_by: user.id,
        })
        .select('id, name, join_code')
        .single();

      if (teamError) throw teamError;

      // Upload logo if exists
      if (logoFile) {
        const logoUrl = await uploadLogo(teams.id, logoFile);
        
        const { error: updateError } = await supabase
          .from("teams")
          .update({ logo_url: logoUrl })
          .eq('id', teams.id);

        if (updateError) throw updateError;
      }

      // Add creator as owner
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: teams.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      onSuccess(teams.join_code);
    } catch (error: any) {
      console.error("Error creating team:", error);
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleCreate,
  };
};