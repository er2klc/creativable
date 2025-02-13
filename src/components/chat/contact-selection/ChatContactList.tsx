
import { Tables } from "@/integrations/supabase/types";
import { ChatContactCard } from "./ChatContactCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatContactListProps {
  contacts: Tables<"leads">[];
  onSelect: (contact: Tables<"leads">) => void;
  selectedId?: string;
}

export const ChatContactList = ({ contacts, onSelect, selectedId }: ChatContactListProps) => {
  if (!contacts.length) return null;

  return (
    <div className="w-full h-[80px] min-h-[80px] py-2 border-t">
      <ScrollArea className="w-full h-full" orientation="horizontal">
        <div className="flex gap-2 px-4 snap-x snap-mandatory">
          {contacts.map((contact) => (
            <ChatContactCard
              key={contact.id}
              contact={contact}
              onClick={() => onSelect(contact)}
              selected={contact.id === selectedId}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
