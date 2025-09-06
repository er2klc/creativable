
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  RefreshCw, 
  Search, 
  Star, 
  Inbox, 
  MailX, 
  Archive, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ExternalEmailApiService } from '@/features/email/services/ExternalEmailApiService';

interface EmailListProps {
  onSelectEmail: (emailId: string) => void;
  selectedEmailId: string | null;
  currentFolder?: string;
  apiSettings?: any;
}

export function EmailList({ 
  onSelectEmail, 
  selectedEmailId, 
  currentFolder = 'INBOX',
  apiSettings
}: EmailListProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Query to fetch emails
  const { 
    data: emails, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['emails', currentFolder, searchQuery],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('emails')
        .select('*')
        .eq('user_id', user.id)
        .eq('folder', currentFolder.toLowerCase())
        .eq('archived', false)
        .order('sent_at', { ascending: false });
      
      // Apply search filter if provided
      if (searchQuery) {
        query = query.or(`subject.ilike.%${searchQuery}%,from_email.ilike.%${searchQuery}%,to_email.ilike.%${searchQuery}%,text_content.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Sync emails with the server
  const syncEmails = async () => {
    if (!apiSettings) {
      toast.error("Email settings not configured");
      return;
    }
    
    if (isSyncing) {
      toast.info("Sync already in progress");
      return;
    }
    
    setIsSyncing(true);
    const toastId = toast.loading("Syncing emails...");
    
    try {
      const result = await ExternalEmailApiService.syncEmailsWithPagination({
        host: apiSettings.host,
        port: apiSettings.port,
        user: apiSettings.username,
        password: apiSettings.password,
        folder: currentFolder,
        tls: apiSettings.tls
      });
      
      if (result.success) {
        toast.dismiss(toastId);
        toast.success(`Successfully synced ${result.emailsCount || 0} emails`);
        // Refresh the email list
        queryClient.invalidateQueries({ queryKey: ['emails'] });
        refetch();
      } else {
        toast.dismiss(toastId);
        toast.error(`Failed to sync emails: ${result.error}`);
      }
    } catch (error) {
      console.error("Error syncing emails:", error);
      toast.dismiss(toastId);
      toast.error("An error occurred while syncing emails");
    } finally {
      setIsSyncing(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{currentFolder}</h2>
          <Button variant="ghost" size="icon" disabled>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="mb-4">
          <Input 
            placeholder="Search emails..." 
            className="w-full"
            disabled
          />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 border rounded-md mb-2">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2 mb-1" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{currentFolder}</h2>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-10">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-2">Error loading emails</p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (!emails || emails.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{currentFolder}</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={syncEmails}
            disabled={isSyncing || !apiSettings}
          >
            {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
        <div className="mb-4">
          <Input 
            placeholder="Search emails..." 
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col items-center justify-center py-10">
          <MailX className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-medium mb-2">No emails found</p>
          <p className="text-sm text-muted-foreground text-center mb-4">
            {searchQuery 
              ? `No emails match your search "${searchQuery}"`
              : `Your ${currentFolder.toLowerCase()} is empty`
            }
          </p>
          {!searchQuery && (
            <Button onClick={syncEmails} disabled={isSyncing || !apiSettings}>
              {isSyncing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Emails
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Get folder icon
  const getFolderIcon = () => {
    switch (currentFolder.toLowerCase()) {
      case 'inbox':
        return <Inbox className="h-5 w-5 mr-2" />;
      case 'archive':
        return <Archive className="h-5 w-5 mr-2" />;
      case 'trash':
        return <MailX className="h-5 w-5 mr-2" />;
      default:
        return <Inbox className="h-5 w-5 mr-2" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            {getFolderIcon()}
            {currentFolder}
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={syncEmails}
            disabled={isSyncing}
            title="Sync emails"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search emails..." 
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {emails.map((email) => (
            <div 
              key={email.id}
              className={`p-3 rounded-md cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                selectedEmailId === email.id ? 'bg-gray-100 dark:bg-gray-800' : ''
              } ${
                !email.read ? 'font-medium' : ''
              }`}
              onClick={() => onSelectEmail(email.id)}
            >
              <div className="flex justify-between items-start">
                <div className="truncate flex-1">
                  <div className="flex items-center">
                    {email.starred && (
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1 flex-shrink-0" />
                    )}
                    <span className="truncate block">
                      {email.from_name || email.from_email}
                    </span>
                  </div>
                  <div className="truncate text-sm font-medium">
                    {email.subject || "(No Subject)"}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">
                    {email.text_content?.substring(0, 100) || "No content"}
                  </div>
                </div>
                <div className="text-xs text-right text-muted-foreground whitespace-nowrap pl-2">
                  {formatDate(email.sent_at, 'de-DE').split(' ')[0]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
