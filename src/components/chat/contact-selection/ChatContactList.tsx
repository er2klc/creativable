
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
    <div className="space-y-2 max-h-[300px] overflow-y-auto p-2">
      {contacts.map((contact) => (
        <ChatContactCard
          key={contact.id}
          contact={contact}
          onClick={() => onSelect(contact)}
          selected={contact.id === selectedId}
        />
      ))}
    </div>
  );
};
