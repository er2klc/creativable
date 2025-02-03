import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { Tables } from "@/integrations/supabase/types";
import { PartnerTree } from "@/components/partners/PartnerTree";
import { Button } from "@/components/ui/button";
import { Diamond, Trophy, Gem, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pool() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { status = 'partner' } = useParams<{ status?: string }>();

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
      return data as Tables<"leads">[];
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return profile as Tables<"profiles">;
    },
  });

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
      {/* Enhanced Header Design with Responsive Layout */}
      <div className="mb-8">
        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-4 justify-center">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isActive = status === option.id;
            
            return (
              <Button
                key={option.id}
                variant="ghost"
                className={cn(
                  "relative group w-full md:min-w-[160px] h-[50px] md:h-[60px] transition-all duration-300",
                  "bg-gradient-to-r shadow-lg border-0",
                  isActive ? `${option.gradient} text-white md:scale-110` : "bg-background hover:scale-105",
                  !isActive && "hover:bg-gradient-to-r",
                  !isActive && option.hoverGradient,
                  "hover:text-white"
                )}
                onClick={() => window.location.href = `/pool/${option.id}`}
              >
                <div className="absolute inset-0 bg-black/5 rounded-md" />
                <div className="relative flex items-center justify-center gap-2 md:gap-3 font-semibold">
                  <Icon className={cn(
                    "h-4 w-4 md:h-5 md:w-5 transition-all duration-300",
                    isActive ? "scale-110" : "scale-100",
                    !isActive && "group-hover:scale-110"
                  )} />
                  <span className="text-xs md:text-sm">{option.label}</span>
                </div>
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full shadow-lg" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Content based on status */}
      {status === 'partner' && (
        <PartnerTree 
          unassignedPartners={leads} 
          currentUser={currentUser}
          onContactClick={setSelectedLeadId}
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