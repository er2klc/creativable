import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadDetailHeader } from "./LeadDetailHeader";
import { useLeadSubscription } from "./hooks/useLeadSubscription";
import { LeadWithRelations } from "./types/lead";
import { LeadDetailContent } from "./components/LeadDetailContent";
import { useLeadMutations } from "./hooks/useLeadMutations";

interface LeadDetailViewProps {
  leadId: string;
  onClose: () => void;
}

export function LeadDetailView({ leadId, onClose }: LeadDetailViewProps) {
  const { settings } = useSettings();

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
          lead_files (*)
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

  const { updateLeadMutation, deleteLeadMutation } = useLeadMutations(leadId, onClose);

  useLeadSubscription(leadId);

  if (isLoading || !lead) {
    return (
      <div className="p-6">
        {settings?.language === "en" ? "Loading..." : "Lädt..."}
      </div>
    );
  }

  return (
    <>
      <LeadDetailHeader
        lead={lead}
        onUpdateLead={updateLeadMutation.mutate}
        onDeleteLead={() => deleteLeadMutation.mutate()}
      />
      <LeadDetailContent 
        lead={lead}
        onUpdateLead={updateLeadMutation.mutate}
        isLoading={isLoading}
      />
    </>
  );
}
