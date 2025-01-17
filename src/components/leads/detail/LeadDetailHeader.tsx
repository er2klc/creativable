import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Award, Users, XCircle } from "lucide-react";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { toast } from "sonner";
import { Platform, getPlatformConfig } from "@/config/platforms";

interface LeadDetailHeaderProps {
  lead: Tables<"leads"> & {
    platform: Platform;
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
  };
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function LeadDetailHeader({ lead, onUpdateLead }: LeadDetailHeaderProps) {
  const platformConfig = getPlatformConfig(lead.platform);

  const handleStatusChange = async (status: string) => {
    try {
      await onUpdateLead({ status });
      toast.success(`Status auf ${status} geändert`);
    } catch (error) {
      toast.error("Fehler beim Ändern des Status");
    }
  };

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{lead.name}</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleStatusChange('partner')}
              >
                <Users className="h-4 w-4 mr-2" />
                Partner
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleStatusChange('customer')}
              >
                <Award className="h-4 w-4 mr-2" />
                Kunde
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleStatusChange('not_for_now')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Not For Now
              </Button>
            </div>
          </div>
          <CompactPhaseSelector
            lead={lead}
            onUpdateLead={onUpdateLead}
          />
        </div>
      </div>
    </div>
  );
}