
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MentionListProps {
  items: any[];
  command: (item: any) => void;
}

export const MentionList = ({ items, command }: MentionListProps) => {
  return (
    <div className="overflow-hidden rounded-md border bg-popover p-1 shadow-md">
      {items.map((item) => (
        <button
          key={item.id}
          className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
          onClick={() => command(item)}
        >
          <Avatar className="h-6 w-6 mr-2">
            <AvatarImage src={item.avatar_url} />
            <AvatarFallback>
              {item.display_name?.substring(0, 2).toUpperCase() || "??"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{item.display_name}</span>
            <span className="text-xs text-muted-foreground">
              Level {item.level || 1}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
