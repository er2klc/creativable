
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Filter, Clock, Paperclip, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmailMessages } from '../../hooks/useEmailMessages';
import { Skeleton } from '@/components/ui/skeleton';

interface EmailListProps {
  folder: string;
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}

export function EmailList({ folder, selectedEmailId, onSelectEmail }: EmailListProps) {
  const { emails, isLoading, syncEmails, syncInProgress } = useEmailMessages(folder);
  
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
          <Button 
            variant="outline" 
            size="icon" 
            disabled={syncInProgress}
            onClick={() => syncEmails(true)}
          >
            {syncInProgress ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          // Loading state
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="p-4 border-b">
              <div className="flex items-start gap-2">
                <Skeleton className="h-4 w-4 mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : emails.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <p className="mb-2">Keine E-Mails in diesem Ordner</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => syncEmails(true)}
              disabled={syncInProgress}
            >
              {syncInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Synchronisieren...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  E-Mails synchronisieren
                </>
              )}
            </Button>
          </div>
        ) : (
          // Email list
          emails.map((email) => (
            <button
              key={email.id}
              className={cn(
                "w-full text-left px-4 py-3 border-b transition-colors hover:bg-muted/50 relative",
                selectedEmailId === email.id && "bg-muted",
                !email.read && "bg-blue-50 dark:bg-blue-950/20"
              )}
              onClick={() => onSelectEmail(email.id)}
            >
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  <Star 
                    className={cn(
                      "h-4 w-4", 
                      email.is_starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    )} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn(
                      "truncate text-sm",
                      !email.read && "font-medium"
                    )}>
                      {email.from_name || email.from_email}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground flex items-center gap-1">
                      {email.has_attachments && <Paperclip className="h-3 w-3" />}
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(email.sent_at)}
                      </span>
                    </span>
                  </div>
                  
                  <p className={cn(
                    "truncate text-sm",
                    !email.read && "font-medium"
                  )}>
                    {email.subject || "(Kein Betreff)"}
                  </p>
                  
                  <p className="truncate text-xs text-muted-foreground">
                    {email.text_content || ""}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
