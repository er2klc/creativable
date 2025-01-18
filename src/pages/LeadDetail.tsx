import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { LeadInfoCard } from "@/components/leads/detail/LeadInfoCard";
import { LeadDetailHeader } from "@/components/leads/detail/LeadDetailHeader";
import { LeadSummary } from "@/components/leads/detail/LeadSummary";
import { Platform } from "@/config/platforms";
import { toast } from "sonner";
import { LeadDetailTabs } from "@/components/leads/detail/LeadDetailTabs";
import { useEffect } from "react";
import { LeadTimeline } from "@/components/leads/detail/LeadTimeline";

type LeadWithRelations = Tables<"leads"> & {
  platform: Platform;
  messages: Tables<"messages">[];
  tasks: Tables<"tasks">[];
  notes: Tables<"notes">[];
};

export default function LeadDetail() {
  const { leadId } = useParams();
  const queryClient = useQueryClient();

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      
      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          messages (*),
          tasks (*),
          notes (*)
        `)
        .eq("id", leadId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      return data as LeadWithRelations;
    },
    enabled: !!leadId,
  });

  // Subscribe to real-time updates for the lead
  useEffect(() => {
    if (!lead?.id) return;

    const channel = supabase
      .channel('lead-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${lead.id}`
        },
        (payload) => {
          queryClient.setQueryData(["lead", leadId], (oldData: LeadWithRelations | undefined) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              ...payload.new,
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lead?.id, leadId, queryClient]);

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
      if (!lead?.id) return null;
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", lead.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Kontakt erfolgreich aktualisiert");
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
      toast.success("Phasenänderung erfolgreich gelöscht");
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Lädt...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-destructive">
        Ein Fehler ist aufgetreten: {error.message}
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Kontakt wurde nicht gefunden
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LeadDetailHeader 
        lead={lead} 
        onUpdateLead={updateLeadMutation.mutate} 
      />
      
      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 space-y-6">
            <div className="overflow-hidden bg-gradient-to-b from-white to-gray-70 p-6">
              <LeadSummary lead={lead} />
            </div>
            <LeadInfoCard lead={lead} />
          </div>

          <div className="col-span-8 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <LeadDetailTabs lead={lead} />
            </div>
            <div className="rounded-lg">
              <LeadTimeline 
                lead={lead} 
                onDeletePhaseChange={deletePhaseChangeMutation.mutate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
