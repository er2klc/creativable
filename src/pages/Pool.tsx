import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { Tables } from "@/integrations/supabase/types";
import { PartnerTree } from "@/components/partners/PartnerTree";

export default function Pool() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { status = 'partner' } = useParams<{ status?: string }>();
  const navigate = useNavigate();

  const { data: leads = [] } = useQuery({
    queryKey: ["pool-leads", status],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get the user's network marketing ID
      const { data: settings } = await supabase
        .from('settings')
        .select('network_marketing_id')
        .eq('user_id', user.id)
        .single();

      // Get leads that are either:
      // 1. Created by the current user
      // 2. Have a matching network_marketing_id with the current user's settings
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("status", status)
        .or(`user_id.eq.${user.id},network_marketing_id.eq.${settings?.network_marketing_id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tables<"leads">[];
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
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

      return profile;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
  });

  const handleContactClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue={status} className="w-full">
        <TabsList>
          <TabsTrigger value="partner">Partner</TabsTrigger>
          <TabsTrigger value="customer">Kunden</TabsTrigger>
          <TabsTrigger value="not_for_now">Not For Now</TabsTrigger>
          <TabsTrigger value="no_interest">Kein Interesse</TabsTrigger>
        </TabsList>

        <TabsContent value="partner" className="mt-6">
          <PartnerTree 
            unassignedPartners={leads} 
            currentUser={currentUser}
            onContactClick={handleContactClick}
          />
        </TabsContent>

        <TabsContent value="customer">
          <div className="text-center p-4">
            Kunden Kanban View kommt hier...
          </div>
        </TabsContent>

        <TabsContent value="not_for_now">
          <div className="text-center p-4">
            Not For Now Liste kommt hier...
          </div>
        </TabsContent>

        <TabsContent value="no_interest">
          <div className="text-center p-4">
            Kein Interesse Liste kommt hier...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}