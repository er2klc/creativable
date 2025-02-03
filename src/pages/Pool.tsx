import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { Tables } from "@/integrations/supabase/types";
import { PartnerTree } from "@/components/partners/PartnerTree";
import { Button } from "@/components/ui/button";
import { Users, Star, Clock, XCircle } from "lucide-react";
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
    { id: 'partner', label: 'Partner', icon: Users, color: 'bg-green-500' },
    { id: 'customer', label: 'Kunden', icon: Star, color: 'bg-blue-500' },
    { id: 'not_for_now', label: 'Not For Now', icon: Clock, color: 'bg-yellow-500' },
    { id: 'no_interest', label: 'Kein Interesse', icon: XCircle, color: 'bg-red-500' }
  ];

  return (
    <div className="container mx-auto py-6">
      {/* New Header Design */}
      <div className="mb-8 space-y-6">
        <div className="flex flex-wrap gap-3">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.id}
                variant={status === option.id ? "default" : "outline"}
                className={cn(
                  "relative group transition-all duration-300 min-w-[140px]",
                  status === option.id && "shadow-lg scale-105"
                )}
                onClick={() => window.location.href = `/pool/${option.id}`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    "h-4 w-4 transition-colors",
                    status === option.id ? "text-white" : option.color
                  )} />
                  <span>{option.label}</span>
                </div>
                {status === option.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 rounded-b-md bg-white/20" />
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