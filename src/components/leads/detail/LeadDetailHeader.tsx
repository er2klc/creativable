import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LeadAvatar } from "./LeadAvatar";

interface LeadDetailHeaderProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export const LeadDetailHeader = ({ lead }: LeadDetailHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/contacts")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-3">
          <LeadAvatar 
            name={lead.name} 
            avatarUrl={lead.avatar_url || lead.social_media_profile_image_url} 
            className="h-10 w-10"
          />
          <div>
            <h2 className="text-lg font-semibold">{lead.name}</h2>
            {lead.bio && (
              <p className="text-sm text-muted-foreground">{lead.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};