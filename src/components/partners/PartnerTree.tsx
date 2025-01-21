import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Users, UserPlus, Network } from "lucide-react";

export function PartnerTree() {
  const navigate = useNavigate();

  const { data: partners = [] } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("status", "partner")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handlePartnerClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      <AccordionItem value="partner-lobby" className="border rounded-lg bg-white">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Partner Lobby</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <Card 
                key={partner.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handlePartnerClick(partner.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{partner.name}</h3>
                    <p className="text-sm text-gray-500">
                      {partner.onboarding_progress && 
                       !Object.values(partner.onboarding_progress).every(value => value) 
                        ? "Onboarding ausstehend"
                        : "Onboarding abgeschlossen"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="partner-tree" className="border rounded-lg bg-white">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Partner Baum</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="text-center text-gray-500 py-8">
            Partner Baum Visualisierung (in Entwicklung)
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}