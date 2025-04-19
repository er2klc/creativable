
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Tables } from "@/integrations/supabase/types";

interface LeadAvatarProps {
  lead: Tables<"leads">;
}

export const LeadAvatar = ({ lead }: LeadAvatarProps) => {
  const initials = getInitials(lead.name);
  const imageUrl = lead.social_media_profile_image_url;
  
  const getPlatformColor = () => {
    switch (lead.platform) {
      case "LinkedIn":
        return "bg-[#0077B5]";
      case "Instagram":
        return "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45]";
      case "Facebook":
        return "bg-[#3b5998]";
      case "Email":
        return "bg-[#EA4335]";
      default:
        return "bg-primary";
    }
  };

  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src={imageUrl || undefined} alt={lead.name} />
      <AvatarFallback className={getPlatformColor()}>
        <span className="text-white">{initials}</span>
      </AvatarFallback>
    </Avatar>
  );
};
