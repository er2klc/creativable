
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Paperclip, Star, Loader2, SearchX, MailOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { normalizeFolderPath } from '../../hooks/useEmailFolders.helper';

interface EmailListProps {
  folderPath: string;
  selectedEmailId: string | null;
  onSelectEmail: (emailId: string) => void;
  searchQuery?: string;
}

interface Email {
  id: string;
  subject: string;
  from_name: string;
  from_email: string;
  sent_at: string;
  read: boolean;
  starred: boolean;
  has_attachments: boolean;
}

export function EmailList({ 
  folderPath, 
  selectedEmailId, 
  onSelectEmail, 
  searchQuery = '' 
}: EmailListProps) {
  const { user } = useAuth();
  const normalizedFolderPath = normalizeFolderPath(folderPath);
  
  const { data: emails, isLoading, error, refetch } = useQuery({
    queryKey: ['emails', user?.id, normalizedFolderPath, searchQuery],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        console.log(`Fetching emails for folder: ${normalizedFolderPath}`);
        
        let query = supabase
          .from('emails')
          .select('*')
          .eq('user_id', user.id)
          .eq('folder', normalizedFolderPath)
          .order('sent_at', { ascending: false });
          
        // Apply search filter if provided
        if (searchQuery) {
          query = query.or(`subject.ilike.%${searchQuery}%,from_name.ilike.%${searchQuery}%,from_email.ilike.%${searchQuery}%,text_content.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching emails:', error);
          throw error;
        }
        
        console.log(`Found ${data?.length || 0} emails in folder ${normalizedFolderPath}`);
        return data as Email[];
      } catch (err) {
        console.error('Error fetching emails:', err);
        return [];
      }
    },
    enabled: !!user && !!normalizedFolderPath,
  });
  
  useEffect(() => {
    if (user && normalizedFolderPath) {
      refetch();
    }
  }, [normalizedFolderPath, refetch, user]);

  if (isLoading) {
    return (
      <div className="p-3 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b">
          <h3 className="text-sm font-semibold">Loading emails...</h3>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 border-b">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error loading emails</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
        {searchQuery ? (
          <>
            <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-center">No matching emails found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term</p>
          </>
        ) : (
          <>
            <MailOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-center">
              {normalizedFolderPath === 'INBOX' ? 'Your inbox is empty' : 'No emails in this folder'}
            </p>
          </>
        )}
      </div>
    );
  }

  const formatSentDate = (sentAt: string) => {
    try {
      return formatDistanceToNow(new Date(sentAt), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center p-3 border-b bg-muted/30">
        <h3 className="text-sm font-semibold">
          {normalizedFolderPath === 'INBOX' ? 'Inbox' : normalizedFolderPath} 
          <span className="text-muted-foreground ml-1 font-normal">({emails.length})</span>
        </h3>
      </div>
      
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="divide-y">
          {emails.map((email) => (
            <div 
              key={email.id}
              className={cn(
                "flex flex-col p-3 cursor-pointer group",
                selectedEmailId === email.id ? "bg-muted" : "hover:bg-muted/50",
                !email.read && "font-medium"
              )}
              onClick={() => onSelectEmail(email.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    {email.from_name ? (
                      <p className="truncate">{email.from_name}</p>
                    ) : (
                      <p className="truncate">{email.from_email}</p>
                    )}
                    {email.has_attachments && (
                      <Paperclip className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className={cn(
                    "text-sm truncate",
                    email.read ? "text-muted-foreground" : "text-foreground"
                  )}>
                    {email.subject || "(No Subject)"}
                  </p>
                </div>
                <div className="flex flex-col items-end ml-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatSentDate(email.sent_at)}
                  </span>
                  {email.starred && (
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mt-1" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
