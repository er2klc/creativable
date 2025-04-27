
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { ContactItem } from "./ContactItem";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatContactListProps {
  contacts: any[];
  onSelect: (contact: any) => void;
  selectedId?: string;
}

export function ChatContactList({ contacts, onSelect, selectedId }: ChatContactListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    return contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  return (
    <div className="p-4 space-y-4">
      <Input
        placeholder="Kontakt suchen..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {filteredContacts.map(contact => (
            <ContactItem 
              key={contact.id}
              contact={contact}
              isSelected={contact.id === selectedId}
              onSelect={() => onSelect(contact)}
            />
          ))}
          {filteredContacts.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Keine Kontakte gefunden
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
