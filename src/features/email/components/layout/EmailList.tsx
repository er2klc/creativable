
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Paperclip, Star, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmailListProps {
  folder: string;
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

export function EmailList({ folder, selectedEmailId, onSelectEmail, searchQuery = '' }: EmailListProps) {
  const { user } = useAuth();
  
  const { data: emails, isLoading, error, refetch } = useQuery({
    queryKey: ['emails', folder, searchQuery],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        let query = supabase
          .from('emails')
          .select('*')
          .eq('user_id', user.id)
          .eq('folder', folder)
          .order('sent_at', { ascending: false });
          
        // Apply search filter if provided
        if (searchQuery) {
          query = query.or(`subject.ilike.%${searchQuery}%,from_name.ilike.%${searchQuery}%,from_email.ilike.%${searchQuery}%`);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        return data as Email[];
      } catch (err) {
        console.error('Error fetching emails:', err);
        return [];
      }
    },
    enabled: !!user,
  });
  
  useEffect(() => {
    refetch();
  }, [folder, refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Error loading emails</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!emails || emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p className="mb-2">No emails found</p>
        {searchQuery && (
          <p className="text-sm">Try a different search term</p>
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
    <ScrollArea className="h-full">
      <div className="divide-y">
        {emails.map((email) => (
          <div 
            key={email.id}
            className={cn(
              "flex flex-col p-3 cursor-pointer",
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
  );
}
