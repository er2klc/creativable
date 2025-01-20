import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LeadDetailView } from "@/components/leads/LeadDetailView";
import { Tables } from "@/integrations/supabase/types";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

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

        <TabsContent value="partner" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <Card 
                key={lead.id} 
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedLeadId(lead.id)}
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <div className="bg-primary h-full w-full flex items-center justify-center text-white font-semibold">
                      {lead.name.charAt(0)}
                    </div>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{lead.name}</h3>
                    <p className="text-sm text-gray-500">{lead.company_name || 'Kein Unternehmen'}</p>
                  </div>
                </div>
              </Card>
            ))}
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