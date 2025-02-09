
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Diamond, Trophy, Gem, Star, LayoutList, KanbanSquare } from "lucide-react";
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
      icon: Diamond,
      iconBg: 'bg-emerald-500',
      gradient: 'from-emerald-400 to-emerald-600',
      hoverGradient: 'hover:from-emerald-500 hover:to-emerald-700',
      count: leads.filter(lead => lead.status === 'partner').length
    },
    { 
      id: 'customer', 
      label: 'Kunden', 
      icon: Trophy,
      iconBg: 'bg-blue-500',
      gradient: 'from-blue-400 to-blue-600',
      hoverGradient: 'hover:from-blue-500 hover:to-blue-700',
      count: leads.filter(lead => lead.status === 'customer').length
    },
    { 
      id: 'not_for_now', 
      label: 'Not For Now', 
      icon: Gem,
      iconBg: 'bg-amber-500',
      gradient: 'from-amber-400 to-amber-600',
      hoverGradient: 'hover:from-amber-500 hover:to-amber-700',
      count: leads.filter(lead => lead.status === 'not_for_now').length
    },
    { 
      id: 'no_interest', 
      label: 'Kein Interesse', 
      icon: Star,
      iconBg: 'bg-rose-500',
      gradient: 'from-rose-400 to-rose-600',
      hoverGradient: 'hover:from-rose-500 hover:to-rose-700',
      count: leads.filter(lead => lead.status === 'no_interest').length
    }
  ];

  const filteredLeads = leads.filter(lead => lead.status === status);

  return (
    <div className="px-4 md:px-8 max-w-full overflow-x-hidden">
      <PoolHeader />
      <div className="pt-20 md:pt-[84px] mb-8">
        {isMobile ? (
          <Tabs defaultValue={status} className="w-full" onValueChange={(value) => navigate(`/pool/${value}`)}>
            <TabsList className="grid grid-cols-2 h-auto gap-2 bg-transparent">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <TabsTrigger 
                    key={option.id}
                    value={option.id}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 h-auto data-[state=active]:bg-gradient-to-r",
                      "border border-dashed border-gray-300",
                      status === option.id && option.gradient,
                      status === option.id ? "text-white" : "text-gray-600"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium text-sm">{option.label}</span>
                    <span className="text-xs">
                      {option.count} {option.count === 1 ? 'Kontakt' : 'Kontakte'}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              const isActive = status === option.id;
              
              return (
                <Button
                  key={option.id}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "relative h-[80px] w-full transition-all duration-300",
                    "bg-gradient-to-r shadow-sm border border-dashed border-gray-300",
                    isActive ? `${option.gradient} text-white border-none` : "bg-background hover:scale-102",
                    !isActive && "hover:bg-gradient-to-r",
                    !isActive && option.hoverGradient,
                    "hover:text-white"
                  )}
                  onClick={() => navigate(`/pool/${option.id}`)}
                >
                  <div className="absolute inset-0 bg-black/5 rounded-md" />
                  <div className="relative flex flex-col items-center justify-center gap-1">
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      <Icon className={cn(
                        "h-5 w-5 transition-all duration-300",
                        isActive ? "scale-110" : "scale-100"
                      )} />
                      {option.label}
                    </div>
                    <div className="text-sm font-medium">
                      {option.count} {option.count === 1 ? 'Kontakt' : 'Kontakte'}
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-lg" />
                  )}
                </Button>
              );
            })}
          </div>
        )}

        {!isMobile && (
          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="w-[100px]"
            >
              <LayoutList className="h-4 w-4 mr-2" />
              Liste
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="w-[100px]"
            >
              <KanbanSquare className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-hidden w-full">
        {status === 'partner' && (
          <>
            {viewMode === 'kanban' ? (
              <PartnerOnboardingPipeline />
            ) : (
              <LeadTableView 
                leads={filteredLeads}
                onLeadClick={setSelectedLeadId}
                selectedPipelineId={null}
              />
            )}
          </>
        )}

        {status === 'customer' && (
          <LeadTableView 
            leads={filteredLeads}
            onLeadClick={setSelectedLeadId}
            selectedPipelineId={null}
          />
        )}

        {status === 'not_for_now' && (
          <LeadTableView 
            leads={filteredLeads}
            onLeadClick={setSelectedLeadId}
            selectedPipelineId={null}
          />
        )}

        {status === 'no_interest' && (
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
