import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { Award, Users, XCircle } from "lucide-react";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { toast } from "sonner";

interface LeadDetailHeaderProps {
  lead: Tables<"leads"> & {
    platform: Platform;
  };
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export const LeadDetailHeader = ({ lead, onUpdateLead }: LeadDetailHeaderProps) => {
  const { settings } = useSettings();
  const platformConfig = getPlatformConfig(lead.platform);

  const handleStatusChange = (status: string) => {
    onUpdateLead({ contact_type: status });
    toast.success(
      settings?.language === "en"
        ? `Contact marked as ${status}`
        : `Kontakt als ${status} markiert`
    );
  };

  return (
    <div className="border-b bg-white">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              {lead.name}
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <platformConfig.icon className="h-4 w-4" />
                {lead.platform}
              </span>
            </h1>
            {lead.company_name && (
              <p className="text-muted-foreground mt-1">{lead.company_name}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={lead.contact_type === "Won" ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => handleStatusChange("Won")}
            >
              <Award className="h-4 w-4" />
              {settings?.language === "en" ? "Won" : "Gewonnen"}
            </Button>
            
            <Button
              variant={lead.contact_type === "NotForNow" ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => handleStatusChange("NotForNow")}
            >
              <XCircle className="h-4 w-4" />
              NotForNow
            </Button>
            
            <Button
              variant={lead.contact_type === "Partner" ? "default" : "outline"}
              className="flex items-center gap-2"
              onClick={() => handleStatusChange("Partner")}
            >
              <Users className="h-4 w-4" />
              Partner
            </Button>
          </div>
        </div>
      </div>
      
      <div className="border-t px-6 py-2">
        <CompactPhaseSelector
          lead={lead}
          onUpdateLead={onUpdateLead}
        />
      </div>
    </div>
  );
};