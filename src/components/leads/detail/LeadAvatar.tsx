import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/avatar-utils";

interface LeadAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}

export const LeadAvatar = ({ name, avatarUrl, className }: LeadAvatarProps) => {
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl || undefined} alt={name} />
      <AvatarFallback className="bg-primary/10 text-primary">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};