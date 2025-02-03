import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { Button } from "@/components/ui/button";
import { Diamond, Trophy, Gem, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeadKanbanView } from "@/components/leads/LeadKanbanView";

export default function Pool() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { status = 'partner' } = useParams<{ status?: string }>();
  const navigate = useNavigate();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(null);

  const { data: leads = [] } = useQuery({
    queryKey: ["pool-leads", status],
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
        .eq("status", status)
        .or(`user_id.eq.${user.id},network_marketing_id.eq.${settings?.network_marketing_id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch user's partner pipeline
  const { data: pipeline } = useQuery({
    queryKey: ["partner-pipeline"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "partner")
        .single();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (pipeline?.id) {
      setSelectedPipelineId(pipeline.id);
    }
  }, [pipeline]);

  const statusOptions = [
    { 
      id: 'partner', 
      label: 'Partner', 
      icon: Diamond, 
      gradient: 'from-emerald-400 to-emerald-600',
      hoverGradient: 'hover:from-emerald-500 hover:to-emerald-700'
    },
    { 
      id: 'customer', 
      label: 'Kunden', 
      icon: Trophy, 
      gradient: 'from-blue-400 to-blue-600',
      hoverGradient: 'hover:from-blue-500 hover:to-blue-700'
    },
    { 
      id: 'not_for_now', 
      label: 'Not For Now', 
      icon: Gem, 
      gradient: 'from-amber-400 to-amber-600',
      hoverGradient: 'hover:from-amber-500 hover:to-amber-700'
    },
    { 
      id: 'no_interest', 
      label: 'Kein Interesse', 
      icon: Star, 
      gradient: 'from-rose-400 to-rose-600',
      hoverGradient: 'hover:from-rose-500 hover:to-rose-700'
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isActive = status === option.id;
            
            return (
              <Button
                key={option.id}
                variant="ghost"
                className={cn(
                  "relative min-w-[120px] h-[40px] transition-all duration-300",
                  "bg-gradient-to-r shadow-sm border-0",
                  isActive ? `${option.gradient} text-white opacity-90` : "bg-background hover:scale-102",
                  !isActive && "hover:bg-gradient-to-r",
                  !isActive && option.hoverGradient,
                  "hover:text-white hover:opacity-90"
                )}
                onClick={() => navigate(`/pool/${option.id}`)}
              >
                <div className="absolute inset-0 bg-black/5 rounded-md" />
                <div className="relative flex items-center justify-center gap-2 text-sm font-medium">
                  <Icon className={cn(
                    "h-4 w-4 transition-all duration-300",
                    isActive ? "scale-105" : "scale-100",
                    !isActive && "group-hover:scale-105"
                  )} />
                  {option.label}
                </div>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-lg" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content based on status */}
      {status === 'partner' && selectedPipelineId && (
        <LeadKanbanView 
          leads={leads} 
          selectedPipelineId={selectedPipelineId}
          setSelectedPipelineId={setSelectedPipelineId}
        />
      )}

      {status === 'customer' && (
        <div className="text-center p-4">
          Kunden Kanban View kommt hier...
        </div>
      )}

      {status === 'not_for_now' && (
        <div className="text-center p-4">
          Not For Now Liste kommt hier...
        </div>
      )}

      {status === 'no_interest' && (
        <div className="text-center p-4">
          Kein Interesse Liste kommt hier...
        </div>
      )}

      {selectedLeadId && (
        <LeadDetailView
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
}