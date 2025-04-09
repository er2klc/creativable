
import { Tables } from "@/integrations/supabase/types";
import { ChatContactCard } from "./ChatContactCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";

interface ChatContactListProps {
  contacts: Tables<"leads">[];
  onSelect: (contact: Tables<"leads">) => void;
  selectedId?: string;
}

export const ChatContactList = ({ contacts, onSelect, selectedId }: ChatContactListProps) => {
  if (!contacts.length) return null;

  return (
    <div className="w-full h-[90px] border-t overflow-hidden">
      <ScrollArea className="w-full h-full">
        <div className="flex gap-2 px-4 py-2 snap-x snap-mandatory h-full">
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
