import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { useSession } from "@supabase/auth-helpers-react";

export const usePhaseMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const session = useSession();

  const updateLeadPhase = useMutation({
    mutationFn: async ({ leadId, phaseName }: { leadId: string; phaseName: string }) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      const { error } = await supabase
        .from("leads")
        .update({
          phase: phaseName,
          last_action: settings?.language === "en" ? "Phase changed" : "Phase geändert",
          last_action_date: new Date().toISOString(),
        })
        .eq("id", leadId)
        .eq("user_id", session.user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        description: settings?.language === "en"
          ? "Contact phase has been updated successfully"
          : "Kontaktphase wurde erfolgreich aktualisiert",
      });
    },
    onError: (error) => {
      console.error("Error updating phase:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to update phase. Please try again."
          : "Phase konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  });

  const addPhase = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      // Get the current highest order_index
      const { data: phases } = await supabase
        .from("lead_phases")
        .select("order_index")
        .eq("user_id", session.user.id)
        .order("order_index", { ascending: false })
        .limit(1);

      const nextOrderIndex = phases && phases.length > 0 ? phases[0].order_index + 1 : 0;

      const { error } = await supabase
        .from("lead_phases")
        .insert({
          name: settings?.language === "en" ? "New Phase" : "Neue Phase",
          order_index: nextOrderIndex,
          user_id: session.user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
      toast({
        title: settings?.language === "en" ? "Phase added" : "Phase hinzugefügt",
        description: settings?.language === "en"
          ? "New phase has been added successfully"
          : "Neue Phase wurde erfolgreich hinzugefügt",
      });
    },
  });

  const updatePhaseName = useMutation({
    mutationFn: async ({ id, name, oldName }: { id: string; name: string; oldName: string }) => {
      if (!session?.user?.id) {
        throw new Error("No authenticated user found");
      }

      console.log("Starting phase rename operation:", { id, name, oldName });

      // First update the phase name
      const { error: phaseError } = await supabase
        .from("lead_phases")
        .update({ name })
        .eq("id", id)
        .eq("user_id", session.user.id);

      if (phaseError) {
        console.error("Error updating phase name:", phaseError);
        throw phaseError;
      }

      console.log("Phase name updated successfully, now updating leads...");

      // Then update all leads that were in the old phase
      const { data: updatedLeads, error: leadsError } = await supabase
        .from("leads")
        .update({ 
          phase: name,
          last_action: settings?.language === "en" ? "Phase renamed" : "Phase umbenannt",
          last_action_date: new Date().toISOString(),
        })
        .eq("phase", oldName)
        .eq("user_id", session.user.id);

      console.log("Leads update result:", { updatedLeads, error: leadsError });

      if (leadsError) {
        console.error("Error updating leads:", leadsError);
        throw leadsError;
      }

      // Return both results
      return { phaseName: name, oldName };
    },
    onSuccess: (data) => {
      console.log("Phase rename operation completed successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["lead-phases"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      toast({
        title: settings?.language === "en" ? "Phase updated" : "Phase aktualisiert",
        description: settings?.language === "en"
          ? "Phase name and all associated contacts have been updated successfully"
          : "Phasenname und alle zugehörigen Kontakte wurden erfolgreich aktualisiert",
      });
    },
    onError: (error) => {
      console.error("Error in phase rename operation:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "Failed to update phase name and contacts. Please try again."
          : "Phasenname und Kontakte konnten nicht aktualisiert werden. Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    }
  });

  return { updateLeadPhase, addPhase, updatePhaseName };
};