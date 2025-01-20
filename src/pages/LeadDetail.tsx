import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { LeadInfoCard } from "@/components/leads/detail/LeadInfoCard";
import { LeadDetailHeader } from "@/components/leads/detail/LeadDetailHeader";
import { LeadSummary } from "@/components/leads/detail/LeadSummary";
import { toast } from "sonner";
import { LeadDetailTabs } from "@/components/leads/detail/LeadDetailTabs";
import { useEffect } from "react";
import { LeadTimeline } from "@/components/leads/detail/LeadTimeline";
import { LeadWithRelations } from "@/components/leads/detail/types/lead";

export default function LeadDetail() {
  const { leadId } = useParams();
  const queryClient = useQueryClient();

  const { data: lead, isLoading, error } = useQuery({
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

      if (error) throw error;
      if (!data) throw new Error("Lead not found");

      return data as LeadWithRelations;
    },
    enabled: !!leadId,
  });

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
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
      toast.success("Lead updated successfully");
    },
    onError: (error) => {
      console.error("Error updating lead:", error);
      toast.error("Error updating lead");
    }
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
      toast.success("Phase change deleted successfully");
    },
  });

  if (error) {
    return <div>Error loading lead</div>;
  }

  if (isLoading || !lead) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <LeadDetailHeader lead={lead} />
      <LeadSummary lead={lead} />
      <LeadInfoCard lead={lead} />
      <LeadDetailTabs lead={lead} />
      <LeadTimeline lead={lead} onDeletePhaseChange={deletePhaseChangeMutation.mutate} />
    </div>
  );
}
