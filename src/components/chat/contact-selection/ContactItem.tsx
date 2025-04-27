
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ContactItemProps {
  contact: any;
  isSelected: boolean;
  onSelect: () => void;
}

export function ContactItem({ contact, isSelected, onSelect }: ContactItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all",
        isSelected 
          ? "bg-primary/10 border-primary" 
          : "hover:bg-muted"
      )}
      onClick={onSelect}
    >
      <Avatar className="h-10 w-10">
        {contact.social_media_profile_image_url ? (
          <AvatarImage 
            src={contact.social_media_profile_image_url} 
            alt={contact.name} 
          />
        ) : (
          <AvatarFallback>
            {contact.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{contact.name}</div>
        {contact.social_media_username && (
          <div className="text-xs text-muted-foreground truncate">
            @{contact.social_media_username.split('/').pop()}
          </div>
        )}
      </div>
    </div>
  );
}
