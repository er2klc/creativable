
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Archive,
  CheckCircle2, 
  Download, 
  Filter, 
  Loader2, 
  Mail, 
  MailX, 
  Paperclip, 
  RefreshCcw, 
  Search, 
  Star, 
  Trash 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmailMessages } from '../../hooks/useEmailMessages';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface EmailListProps {
  folder: string;
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}

export function EmailList({ folder, selectedEmailId, onSelectEmail }: EmailListProps) {
  const { 
    emails, 
    isLoading, 
    syncEmails, 
    syncInProgress,
    markAsRead,
    markAsStarred
  } = useEmailMessages(folder);
  
  const [searchQuery, setSearchQuery] = useState('');
  
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

  // Filter emails based on search query
  const filteredEmails = searchQuery
    ? emails.filter(email => 
        email.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.from_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.text_content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : emails;

  // Email action handlers
  const handleMarkAsRead = (e: React.MouseEvent, emailId: string, isRead: boolean) => {
    e.stopPropagation();
    markAsRead(emailId, !isRead);
  };
  
  const handleToggleStarred = (e: React.MouseEvent, emailId: string, isStarred: boolean) => {
    e.stopPropagation();
    markAsStarred(emailId, !isStarred);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="E-Mails durchsuchen..." 
              className="pl-8" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                <span>Gelesene anzeigen</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MailX className="mr-2 h-4 w-4" />
                <span>Ungelesene anzeigen</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Star className="mr-2 h-4 w-4" />
                <span>Markierte anzeigen</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Paperclip className="mr-2 h-4 w-4" />
                <span>Mit Anhang anzeigen</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="outline" 
            size="icon" 
            disabled={syncInProgress}
            onClick={() => syncEmails(true)}
            title="E-Mails aktualisieren"
          >
            {syncInProgress ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
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
        ) : filteredEmails.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 mb-4 text-muted-foreground/50" />
                <p className="mb-2">Keine E-Mails gefunden für "{searchQuery}"</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSearchQuery('')}
                >
                  Suche zurücksetzen
                </Button>
              </>
            ) : (
              <>
                <Mail className="h-12 w-12 mb-4 text-muted-foreground/50" />
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
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      E-Mails synchronisieren
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        ) : (
          // Email list
          filteredEmails.map((email) => (
            <div
              key={email.id}
              className={cn(
                "w-full text-left px-4 py-3 border-b transition-colors hover:bg-muted/50 relative",
                selectedEmailId === email.id && "bg-muted",
                !email.read && "bg-blue-50 dark:bg-blue-950/20"
              )}
            >
              <div className="flex items-start gap-2">
                {/* Email actions and metadata */}
                <div className="flex flex-col items-center gap-1 mt-1">
                  <button
                    onClick={(e) => handleToggleStarred(e, email.id, email.is_starred || false)}
                    className="text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    <Star 
                      className={cn(
                        "h-4 w-4", 
                        email.is_starred ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      )} 
                    />
                  </button>
                  <button
                    onClick={(e) => handleMarkAsRead(e, email.id, email.read)}
                    className="text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {email.read ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4 fill-blue-400 text-blue-400" />
                    )}
                  </button>
                </div>
                
                {/* Email content */}
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSelectEmail(email.id)}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn(
                      "truncate text-sm",
                      !email.read && "font-medium"
                    )}>
                      {email.from_name || email.from_email}
                    </p>
                    <span className="shrink-0 text-xs text-muted-foreground flex items-center gap-1">
                      {formatDate(email.sent_at)}
                    </span>
                  </div>
                  
                  <p className={cn(
                    "truncate text-sm",
                    !email.read && "font-medium"
                  )}>
                    {email.subject || "(Kein Betreff)"}
                  </p>
                  
                  <div className="flex items-center">
                    <p className="truncate text-xs text-muted-foreground flex-1">
                      {email.text_content?.substring(0, 100) || ""}
                    </p>
                    
                    {email.has_attachments && (
                      <Paperclip className="h-3 w-3 ml-1 flex-shrink-0 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
      
      {filteredEmails.length > 0 && (
        <div className="p-2 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  2
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
