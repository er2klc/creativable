
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Filter, Clock, Paperclip, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailListProps {
  folder: string;
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}

interface EmailItem {
  id: string;
  from: {
    name: string;
    email: string;
  };
  subject: string;
  excerpt: string;
  date: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
}

export function EmailList({ folder, selectedEmailId, onSelectEmail }: EmailListProps) {
  // Mock emails - in a real implementation, these would come from the backend
  const emails: EmailItem[] = [
    {
      id: '1',
      from: { name: 'Max Mustermann', email: 'max@example.com' },
      subject: 'Meeting am Donnerstag',
      excerpt: 'Hallo, lass uns am Donnerstag um 14 Uhr treffen, um das neue Projekt zu besprechen.',
      date: new Date(2023, 4, 15, 9, 30),
      isRead: false,
      isStarred: true,
      hasAttachment: true,
    },
    {
      id: '2',
      from: { name: 'Anna Schmidt', email: 'anna@example.com' },
      subject: 'Dokumente für den Vertrag',
      excerpt: 'Im Anhang findest du die Unterlagen, die wir für den neuen Vertrag benötigen.',
      date: new Date(2023, 4, 14, 15, 45),
      isRead: true,
      isStarred: false,
      hasAttachment: true,
    },
    {
      id: '3',
      from: { name: 'Technik Support', email: 'support@example.com' },
      subject: 'Ihre Support-Anfrage #12345',
      excerpt: 'Vielen Dank für Ihre Anfrage. Wir haben Ihr Ticket bearbeitet und möchten Ihnen mitteilen...',
      date: new Date(2023, 4, 13, 11, 20),
      isRead: true,
      isStarred: false,
      hasAttachment: false,
    },
  ];

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
    
    if (isToday) {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="E-Mails durchsuchen..." className="pl-8" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {emails.map((email) => (
          <button
            key={email.id}
            className={cn(
              "w-full text-left px-4 py-3 border-b transition-colors hover:bg-muted/50 relative",
              selectedEmailId === email.id && "bg-muted",
              !email.isRead && "bg-blue-50 dark:bg-blue-950/20"
            )}
            onClick={() => onSelectEmail(email.id)}
          >
            <div className="flex items-start gap-2">
              <div className="mt-1">
                <Star 
                  className={cn(
                    "h-4 w-4", 
                    email.isStarred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  )} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={cn(
                    "truncate text-sm",
                    !email.isRead && "font-medium"
                  )}>
                    {email.from.name}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground flex items-center gap-1">
                    {email.hasAttachment && <Paperclip className="h-3 w-3" />}
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(email.date)}
                    </span>
                  </span>
                </div>
                
                <p className={cn(
                  "truncate text-sm",
                  !email.isRead && "font-medium"
                )}>
                  {email.subject}
                </p>
                
                <p className="truncate text-xs text-muted-foreground">
                  {email.excerpt}
                </p>
              </div>
            </div>
          </button>
        ))}
      </ScrollArea>
    </div>
  );
}
