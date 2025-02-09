
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";
import { PartnerOnboardingPipeline } from "@/components/partners/onboarding/PartnerOnboardingPipeline";
import { PoolHeader } from "@/components/pool/PoolHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { LeadTableView } from "@/components/leads/LeadTableView";

export default function Pool() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { status = 'partner' } = useParams<{ status?: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(isMobile ? 'list' : 'kanban');

  const { data: leads = [] } = useQuery({
    queryKey: ["pool-leads"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: settings } = await supabase
        .from('settings')
        .select('network_marketing_id')
        .eq('user_id', user.id)
        .single();

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", user.id)
        .or(`user_id.eq.${user.id},network_marketing_id.eq.${settings?.network_marketing_id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      return data as Tables<"leads">[];
    },
    enabled: true,
  });

  // Update viewMode when isMobile changes
  useEffect(() => {
    setViewMode(isMobile ? 'list' : 'kanban');
  }, [isMobile]);

  const statusOptions = [
    { 
      id: 'partner', 
      label: 'Partner', 
      count: leads.filter(lead => lead.status === 'partner').length
    },
    { 
      id: 'customer', 
      label: 'Kunden', 
      count: leads.filter(lead => lead.status === 'customer').length
    },
    { 
      id: 'not_for_now', 
      label: 'Not For Now', 
      count: leads.filter(lead => lead.status === 'not_for_now').length
    },
    { 
      id: 'no_interest', 
      label: 'Kein Interesse', 
      count: leads.filter(lead => lead.status === 'no_interest').length
    }
  ];

  const filteredLeads = leads.filter(lead => lead.status === status);

  // Filter partner leads by phase
  const getPartnerLeadsByPhase = (phase: string) => {
    return filteredLeads.filter(lead => {
      const progress = lead.onboarding_progress as any;
      switch(phase) {
        case 'start':
          return !progress?.training_provided;
        case 'goals':
          return progress?.training_provided && !progress?.team_invited;
        case 'presentation':
          return progress?.team_invited;
        default:
          return true;
      }
    });
  };

  return (
    <div className="px-4 md:px-8 max-w-full overflow-x-hidden">
      <PoolHeader viewMode={viewMode} setViewMode={setViewMode} />
      <div className="pt-20 md:pt-[84px] mb-8">
        <Tabs defaultValue={status} className="w-full" onValueChange={(value) => navigate(`/pool/${value}`)}>
          <TabsList className="flex h-auto w-full bg-transparent gap-2 justify-start">
            {statusOptions.map((option) => (
              <TabsTrigger 
                key={option.id}
                value={option.id}
                className={cn(
                  "data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
                  "border border-input hover:bg-accent/50",
                  "h-8 px-3 text-sm"
                )}
              >
                {option.label} ({option.count})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="overflow-x-hidden w-full">
        {status === 'partner' && (
          <>
            {viewMode === 'kanban' ? (
              <PartnerOnboardingPipeline />
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Start & Setup</h3>
                  <LeadTableView 
                    leads={getPartnerLeadsByPhase('start')}
                    onLeadClick={setSelectedLeadId}
                    selectedPipelineId={null}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Ziele & Kontakte</h3>
                  <LeadTableView 
                    leads={getPartnerLeadsByPhase('goals')}
                    onLeadClick={setSelectedLeadId}
                    selectedPipelineId={null}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Präsentation & Abschluss</h3>
                  <LeadTableView 
                    leads={getPartnerLeadsByPhase('presentation')}
                    onLeadClick={setSelectedLeadId}
                    selectedPipelineId={null}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {(status === 'customer' || status === 'not_for_now' || status === 'no_interest') && (
          <LeadTableView 
            leads={filteredLeads}
            onLeadClick={setSelectedLeadId}
            selectedPipelineId={null}
          />
        )}
      </div>

      {selectedLeadId && (
        <LeadDetailView
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
}
