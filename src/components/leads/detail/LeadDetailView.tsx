import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Bot } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadInfoCard } from "./LeadInfoCard";
import { TaskList } from "./TaskList";
import { NoteList } from "./NoteList";
import { LeadSummary } from "./LeadSummary";
import { LeadDetailHeader } from "./LeadDetailHeader";
import { LeadMessages } from "./LeadMessages";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadTimeline } from "./LeadTimeline";
import { toast } from "sonner";
import { type Platform } from "@/config/platforms";
import { useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const user = useUser();

  const { data: lead, isLoading, error } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId || !isValidUUID(leadId)) {
        throw new Error("Invalid lead ID");
      }

      const { data, error } = await supabase
        .from("leads")
        .select("*, messages(*), tasks(*), notes(*)")
        .eq("id", leadId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Lead not found");
      }

      return data as (Tables<"leads"> & {
        platform: Platform;
        messages: Tables<"messages">[];
        tasks: Tables<"tasks">[];
        notes: Tables<"notes">[];
      });
    },
    enabled: !!leadId && isValidUUID(leadId),
  });

  // Set up real-time subscriptions for all related tables
  useEffect(() => {
    if (!leadId || !user?.id) return;

    console.log('Setting up real-time subscriptions for leadId:', leadId);

    const channel = supabase
      .channel('lead-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `id=eq.${leadId}`
        },
        (payload) => {
          console.log('Lead changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          console.log('Notes changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          console.log('Tasks changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          console.log('Messages changed:', payload);
          queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up subscriptions');
      supabase.removeChannel(channel);
    };
  }, [leadId, queryClient, user?.id]);

  const updateLeadMutation = useMutation({
    mutationFn: async (updates: Partial<Tables<"leads">>) => {
      if (!leadId || !isValidUUID(leadId) || !user?.id) {
        throw new Error("Invalid lead ID or user not authenticated");
      }

      // First create the phase change note if this is a phase change
      if (updates.phase_id && lead?.phase_id !== updates.phase_id) {
        const oldPhase = lead?.phase_id;
        const newPhase = updates.phase_id;
        
        const { error: noteError } = await supabase
          .from("notes")
          .insert({
            lead_id: leadId,
            user_id: user.id,
            content: `Phase von "${oldPhase}" zu "${newPhase}" geändert`,
            color: "#E9D5FF",
            metadata: {
              type: "phase_change",
              oldPhase,
              newPhase
            }
          });

        if (noteError) {
          console.error("Error creating phase change note:", noteError);
          throw noteError;
        }
      }

      // Then update the lead
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
      toast.success(
        settings?.language === "en"
          ? "Phase change deleted successfully"
          : "Phasenänderung erfolgreich gelöscht"
      );
    },
  });

  if (error) {
    toast.error(
      settings?.language === "en"
        ? "Error loading contact"
        : "Fehler beim Laden des Kontakts"
    );
    onClose();
    return null;
  }

  return (
    <Dialog open={!!leadId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] bg-white border rounded-lg shadow-lg overflow-hidden">
        <DialogHeader className="p-0">
          {lead && (
            <LeadDetailHeader
              lead={lead}
              onUpdateLead={updateLeadMutation.mutate}
            />
          )}
        </DialogHeader>

        {isLoading ? (
          <div className="p-6">{settings?.language === "en" ? "Loading..." : "Lädt..."}</div>
        ) : lead ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <CompactPhaseSelector
                lead={lead}
                onUpdateLead={updateLeadMutation.mutate}
              />
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">
                    {settings?.language === "en" ? "AI Summary" : "KI-Zusammenfassung"}
                  </h3>
                </div>
                <LeadSummary lead={lead} />
              </div>
              
              <LeadInfoCard lead={lead} />
              <LeadTimeline 
                lead={lead} 
                onDeletePhaseChange={deletePhaseChangeMutation.mutate}
              />
              <LeadMessages messages={lead.messages} />
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};