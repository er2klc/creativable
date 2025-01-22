import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LeadAvatarProps {
  avatarUrl?: string | null;
  name: string;
}

export const LeadAvatar = ({ avatarUrl, name }: LeadAvatarProps) => {
  return (
    <Avatar className="h-10 w-10">
      <AvatarImage src={avatarUrl || undefined} alt={name} />
      <AvatarFallback>
        {name?.substring(0, 2).toUpperCase() || '??'}
      </AvatarFallback>
    </Avatar>
  );
};