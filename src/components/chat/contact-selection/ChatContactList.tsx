
import { Tables } from "@/integrations/supabase/types";
import { ChatContactCard } from "./ChatContactCard";

interface ChatContactListProps {
  contacts: Tables<"leads">[];
  onSelect: (contact: Tables<"leads">) => void;
  selectedId?: string;
}

export const ChatContactList = ({ contacts, onSelect, selectedId }: ChatContactListProps) => {
  if (!contacts.length) return null;

  return (
    <div className="relative w-full">
      <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory py-2">
        <div className="flex gap-2 px-2">
          {contacts.map((contact) => (
            <ChatContactCard
              key={contact.id}
              contact={contact}
              onClick={() => onSelect(contact)}
              selected={contact.id === selectedId}
            />
          ))}
        </div>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-gradient-to-l from-background to-transparent w-12 h-full pointer-events-none" />
    </div>
  );
};
