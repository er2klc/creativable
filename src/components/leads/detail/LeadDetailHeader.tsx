import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Award, Users, XCircle, Instagram, Linkedin, Facebook, Video } from "lucide-react";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { toast } from "sonner";
import { Platform } from "@/config/platforms";
import { cn } from "@/lib/utils";

interface LeadDetailHeaderProps {
  lead: Tables<"leads"> & {
    platform: Platform;
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
  };
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function LeadDetailHeader({ lead, onUpdateLead }: LeadDetailHeaderProps) {
  const handleStatusChange = async (status: string) => {
    try {
      await onUpdateLead({ status });
      toast.success(`Status auf ${status} geändert`);
    } catch (error) {
      toast.error("Fehler beim Ändern des Status");
    }
  };

  const PlatformIcon = {
    Instagram: Instagram,
    LinkedIn: Linkedin,
    Facebook: Facebook,
    TikTok: Video,
    Offline: Users,
  }[lead.platform];

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-50">
                <PlatformIcon className="h-5 w-5 text-gray-600" />
              </div>
              <h1 className="text-2xl font-bold">{lead.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors border-b-2",
                  lead.status === 'partner' ? 'border-b-green-500 hover:bg-green-50' : 'border-b-transparent'
                )}
                onClick={() => handleStatusChange('partner')}
              >
                <Users className="h-4 w-4 mr-2" />
                Partner
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors border-b-2",
                  lead.status === 'customer' ? 'border-b-blue-500 hover:bg-blue-50' : 'border-b-transparent'
                )}
                onClick={() => handleStatusChange('customer')}
              >
                <Award className="h-4 w-4 mr-2" />
                Kunde
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors border-b-2",
                  lead.status === 'not_for_now' ? 'border-b-yellow-500 hover:bg-yellow-50' : 'border-b-transparent'
                )}
                onClick={() => handleStatusChange('not_for_now')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Not For Now
              </Button>
            </div>
          </div>
          <div className="border-t pt-4">
            <CompactPhaseSelector
              lead={lead}
              onUpdateLead={onUpdateLead}
            />
          </div>
        </div>
      </div>
    </div>
  );
}