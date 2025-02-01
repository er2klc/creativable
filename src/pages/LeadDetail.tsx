import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadDetailHeader } from "@/components/leads/detail/LeadDetailHeader";
import { useLeadSubscription } from "@/components/leads/detail/hooks/useLeadSubscription";
import { LeadWithRelations } from "@/components/leads/detail/types/lead";
import { LeadDetailContent } from "@/components/leads/detail/LeadDetailContent";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

export default function LeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const queryClient = useQueryClient();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const isValidUUID = (uuid: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) {
        throw new Error("No lead ID provided");
      }

      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          messages (*),
          tasks (*),
          notes (*),
          lead_files (*),
          linkedin_posts (*)
        `)
        .eq("id", leadId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Lead not found");
      }

      return data as LeadWithRelations;
    },
    enabled: !!leadId && isValidUUID(leadId),
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Database['public']['Tables']['leads']['Row']>) => {
      if (!leadId) {
        throw new Error("No lead ID provided");
      }

      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Contact updated successfully"
          : "Kontakt erfolgreich aktualisiert"
      );
    },
    onError: (error) => {
      console.error("Error updating lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error updating contact"
          : "Fehler beim Aktualisieren des Kontakts"
      );
    },
  });

  const deletePhaseChangeMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en"
          ? "Phase change deleted successfully"
          : "Phasenänderung erfolgreich gelöscht"
      );
    },
    onError: (error) => {
      console.error("Error deleting phase change:", error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting phase change"
          : "Fehler beim Löschen der Phasenänderung"
      );
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async () => {
      if (!leadId) return;

      // Delete related records first
      const relatedTables = [
        'messages',
        'tasks',
        'notes',
        'lead_files',
        'contact_group_states',
        'social_media_scan_history',
        'lead_subscriptions'
      ] as const;

      for (const table of relatedTables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('lead_id', leadId);
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error);
          throw error;
        }
      }

      // Finally delete the lead
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(
        settings?.language === "en"
          ? "Contact deleted successfully"
          : "Kontakt erfolgreich gelöscht"
      );
      navigate('/contacts');
    },
    onError: (error) => {
      console.error("Error deleting lead:", error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting contact"
          : "Fehler beim Löschen des Kontakts"
      );
    },
  });

  useLeadSubscription(leadId);

  if (isLoading || !lead) {
    return (
      <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>
    );
  }

  return (
    <div className="mx-auto py-6">
      <LeadDetailHeader
        lead={lead}
        onUpdateLead={updateLeadMutation.mutate}
        onDeleteLead={() => deleteLeadMutation.mutate()}
      />
      <LeadDetailContent 
        lead={lead}
        onUpdateLead={updateLeadMutation.mutate}
        isLoading={isLoading}
        onDeleteClick={() => deleteLeadMutation.mutate()}
        onDeletePhaseChange={(noteId) => deletePhaseChangeMutation.mutate(noteId)}
      />
    </div>
  );
}