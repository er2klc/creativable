import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { LeadInfoCard } from "@/components/leads/detail/LeadInfoCard";
import { LeadDetailHeader } from "@/components/leads/detail/LeadDetailHeader";
import { TaskList } from "@/components/leads/detail/TaskList";
import { NoteList } from "@/components/leads/detail/NoteList";
import { LeadMessages } from "@/components/leads/detail/LeadMessages";
import { LeadSummary } from "@/components/leads/detail/LeadSummary";
import { CompactPhaseSelector } from "@/components/leads/detail/CompactPhaseSelector";
import { Platform } from "@/config/platforms";

export default function LeadDetail() {
  const { slug } = useParams();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data: lead, error } = await supabase
        .from("leads")
        .select("*, messages(*), tasks(*)")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return lead as (Tables<"leads"> & {
        platform: Platform;
        messages: Tables<"messages">[];
        tasks: Tables<"tasks">[];
      });
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!lead) {
    return <div className="p-8">Contact not found</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <LeadDetailHeader lead={lead} onUpdateLead={() => {}} />
      
      <div className="grid grid-cols-12 gap-6">
        {/* Left sidebar with contact info */}
        <div className="col-span-4 space-y-6">
          <LeadInfoCard lead={lead} />
          <TaskList leadId={lead.id} />
        </div>

        {/* Main content area */}
        <div className="col-span-8 space-y-6">
          <CompactPhaseSelector
            lead={lead}
            onUpdateLead={() => {}}
          />
          
          {/* Timeline section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              <LeadMessages messages={lead.messages} />
              <NoteList leadId={lead.id} />
            </div>
          </div>

          <LeadSummary lead={lead} />
        </div>
      </div>
    </div>
  );
}