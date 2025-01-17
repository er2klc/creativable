import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { LeadInfoCard } from "@/components/leads/detail/LeadInfoCard";
import { LeadDetailHeader } from "@/components/leads/detail/LeadDetailHeader";
import { TaskList } from "@/components/leads/detail/TaskList";
import { NoteList } from "@/components/leads/detail/NoteList";
import { LeadMessages } from "@/components/leads/detail/LeadMessages";
import { LeadSummary } from "@/components/leads/detail/LeadSummary";
import { Platform } from "@/config/platforms";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";

export default function LeadDetail() {
  const { leadSlug } = useParams();
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadSlug],
    queryFn: async () => {
      if (!leadSlug) return null;
      
      const { data: lead, error } = await supabase
        .from("leads")
        .select("*, messages(*), tasks(*)")
        .eq("slug", leadSlug)
        .maybeSingle();

      if (error) throw error;
      return lead as (Tables<"leads"> & {
        platform: Platform;
        messages: Tables<"messages">[];
        tasks: Tables<"tasks">[];
      });
    },
    enabled: !!leadSlug,
  });

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
      queryClient.invalidateQueries({ queryKey: ["lead", leadSlug] });
      toast.success(
        settings?.language === "en"
          ? "Contact updated successfully"
          : "Kontakt erfolgreich aktualisiert"
      );
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {settings?.language === "en" ? "Loading..." : "Lädt..."}
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {settings?.language === "en" ? "Contact not found" : "Kontakt nicht gefunden"}
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
          {/* Left column */}
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-lg shadow">
              <LeadSummary lead={lead} />
            </div>
            
            <LeadInfoCard lead={lead} />
            <TaskList leadId={lead.id} />
          </div>

          {/* Right column - Timeline */}
          <div className="col-span-8 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">
                {settings?.language === "en" ? "Timeline" : "Zeitstrahl"}
              </h2>
              <div className="space-y-6">
                <LeadMessages messages={lead.messages} />
                <NoteList leadId={lead.id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}