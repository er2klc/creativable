import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Settings } from "@/integrations/supabase/types/settings";
import { useToast } from "./use-toast";
import { useNavigate } from "react-router-dom";

export function useSettings() {
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: settings, isLoading, refetch: refetchSettings } = useQuery({
    queryKey: ["settings", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log("No user session found, redirecting to auth");
        navigate("/auth");
        throw new Error("No user session found");
      }

      // First verify the user session is still valid
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Invalid session detected:", userError);
        await supabase.auth.signOut();
        navigate("/auth");
        throw new Error("Invalid session");
      }

      console.log("Fetching settings for user:", session.user.id);
      
      // First try to get existing settings
      const { data: existingSettings, error: fetchError } = await supabase
        .from("settings")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching settings:', fetchError);
        // If it's a foreign key error, the user session might be invalid
        if (fetchError.code === '23503') {
          await supabase.auth.signOut();
          navigate("/auth");
          throw new Error("Invalid user session");
        }
        throw fetchError;
      }

      if (existingSettings) {
        return existingSettings as Settings;
      }

      // If no settings exist, create initial settings
      console.log("No settings found, creating initial settings");
      
      // Verify user exists before creating settings
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        console.error("Error verifying user before creating settings:", authError);
        await supabase.auth.signOut();
        navigate("/auth");
        throw new Error("Could not verify user for settings creation");
      }

      const { data: newSettings, error: createError } = await supabase
        .from("settings")
        .insert({
          user_id: session.user.id,
          language: 'de'
        })
        .select()
        .maybeSingle();

      if (createError) {
        console.error('Error creating settings:', createError);
        if (createError.code === '23503') {
          await supabase.auth.signOut();
          navigate("/auth");
          throw new Error("Invalid user session during settings creation");
        }
        throw createError;
      }

      return newSettings as Settings;
    },
    enabled: !!session?.user?.id,
  });

  const updateSettings = async (field: string, value: string | null) => {
    if (!session?.user?.id) {
      console.error("No user session found");
      navigate("/auth");
      return false;
    }

    try {
      console.log("Updating settings:", { field, value });
      
      // Verify user session is still valid
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Invalid session detected during update:", userError);
        await supabase.auth.signOut();
        navigate("/auth");
        return false;
      }

      const { error } = await supabase
        .from('settings')
        .upsert(
          {
            user_id: session.user.id,
            [field]: value,
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'user_id'
          }
        );

      if (error) {
        console.error("Error in updateSettings:", error);
        if (error.code === '23503') {
          await supabase.auth.signOut();
          navigate("/auth");
          throw new Error("Invalid user session during settings update");
        }
        throw error;
      }

      // Invalidate and refetch settings
      await queryClient.invalidateQueries({ queryKey: ["settings", session.user.id] });

      // Only show toast when explicitly updating settings
      if (field !== 'instagram_connected') {
        toast({
          title: "Erfolg ✨",
          description: "Einstellung wurde gespeichert",
        });
      }

      return true;
    } catch (error: any) {
      console.error("Error in updateSettings:", error);
      toast({
        title: "Fehler ❌",
        description: "Einstellung konnte nicht gespeichert werden",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    settings,
    isLoading,
    updateSettings,
    refetchSettings,
  };
}