import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { Tables } from "@/integrations/supabase/types";

export default function Pool() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const { status = 'partner' } = useParams<{ status?: string }>();

  const { data: leads = [] } = useQuery({
    queryKey: ["pool-leads", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Tables<"leads">[];
    },
  });

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue={status} className="w-full">
        <TabsList>
          <TabsTrigger value="partner">Partner</TabsTrigger>
          <TabsTrigger value="customer">Kunden</TabsTrigger>
          <TabsTrigger value="not_for_now">Not For Now</TabsTrigger>
          <TabsTrigger value="no_interest">Kein Interesse</TabsTrigger>
        </TabsList>

        <TabsContent value="partner">
          <div className="text-center p-4">
            Partner Tree View kommt hier...
          </div>
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

      {selectedLeadId && (
        <LeadDetailView
          leadId={selectedLeadId}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
    </div>
  );
}