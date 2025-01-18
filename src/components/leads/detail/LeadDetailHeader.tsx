import { DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { Star, XCircle, Instagram, Linkedin, Facebook, Video, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Platform } from "@/config/platforms";
import { CompactPhaseSelector } from "./CompactPhaseSelector";

interface LeadDetailHeaderProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function LeadDetailHeader({ lead, onUpdateLead }: LeadDetailHeaderProps) {
  const handleNameChange = async (name: string) => {
    await onUpdateLead({ name });
  };

  const handleStatusChange = (status: string) => {
    onUpdateLead({ status });
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "Instagram":
        return <Instagram className="h-4 w-4 mr-2" />;
      case "LinkedIn":
        return <Linkedin className="h-4 w-4 mr-2" />;
      case "Facebook":
        return <Facebook className="h-4 w-4 mr-2" />;
      case "TikTok":
        return <Video className="h-4 w-4 mr-2" />;
      case "Offline":
        return <Users className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <DialogHeader className="p-6 bg-card border-b">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getPlatformIcon(lead.platform as Platform)}
            <input
              type="text"
              value={lead.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "transition-colors border-b-2",
                lead.status === 'partner' ? 'border-b-blue-500 text-blue-700 hover:bg-blue-50' : 'border-b-transparent'
              )}
              onClick={() => handleStatusChange('partner')}
            >
              <Star className="h-4 w-4 mr-2" />
              Partner
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "transition-colors border-b-2",
                lead.status === 'customer' ? 'border-b-green-500 text-green-700 hover:bg-green-50' : 'border-b-transparent'
              )}
              onClick={() => handleStatusChange('customer')}
            >
              <Star className="h-4 w-4 mr-2" />
              Kunde
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "transition-colors border-b-2",
                lead.status === 'not_for_now' ? 'border-b-yellow-500 text-yellow-700 hover:bg-yellow-50' : 'border-b-transparent'
              )}
              onClick={() => handleStatusChange('not_for_now')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Not For Now
            </Button>
            <Button 
              variant="outline"
              size="sm"
              className={cn(
                "transition-colors border-b-2",
                lead.status === 'no_interest' ? 'border-b-red-500 text-red-700 hover:bg-red-50' : 'border-b-transparent'
              )}
              onClick={() => handleStatusChange('no_interest')}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Kein Interesse
            </Button>
          </div>
        </div>
        <CompactPhaseSelector lead={lead} onUpdateLead={onUpdateLead} />
      </div>
    </DialogHeader>
  );
}