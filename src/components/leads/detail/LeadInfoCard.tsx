import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { BasicInformationFields } from "./contact-info/BasicInformationFields";
import { LeadCardHeader } from "./card/LeadCardHeader";

interface LeadInfoCardProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
}

export function LeadInfoCard({ lead, onUpdate }: LeadInfoCardProps) {
  const { settings } = useSettings();

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 border-b border-gray-200/30 shadow-sm">
        <LeadCardHeader lead={lead} />
      </CardHeader>
      <CardContent className="space-y-6">
        <BasicInformationFields lead={lead} onUpdate={onUpdate} />
      </CardContent>
    </Card>
  );
}