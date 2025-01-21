import { Tables } from "@/integrations/supabase/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface PartnerTreeProps {
  unassignedPartners: Tables<"leads">[];
  currentUser: Tables<"profiles"> | null;
  onContactClick: (id: string) => void;
}

type OnboardingProgress = {
  message_sent: boolean;
  team_invited: boolean;
  training_provided: boolean;
  intro_meeting_scheduled: boolean;
};

export const PartnerTree = ({ unassignedPartners, currentUser, onContactClick }: PartnerTreeProps) => {
  const navigate = useNavigate();

  const handleContactClick = (id: string) => {
    navigate(`/contacts/${id}`);
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="unassigned">
        <AccordionTrigger className="text-lg font-semibold">
          Unzugewiesene Partner ({unassignedPartners.length})
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {unassignedPartners.map((partner) => (
              <Card 
                key={partner.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleContactClick(partner.id)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={partner.avatar_url || undefined} />
                    <AvatarFallback>
                      {partner.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {(partner.onboarding_progress as OnboardingProgress)?.training_provided 
                        ? "Training abgeschlossen" 
                        : "Training ausstehend"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="tree">
        <AccordionTrigger className="text-lg font-semibold">
          Partner Baum
        </AccordionTrigger>
        <AccordionContent>
          <div className="p-4 text-center text-muted-foreground">
            Partner Baum Visualisierung kommt hier...
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};