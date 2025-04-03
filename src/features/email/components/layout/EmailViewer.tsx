
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Reply, Forward, Trash, Star, Archive, AlertCircle, MailOpen } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';

interface EmailViewerProps {
  emailId: string | null;
  userEmail?: string;
  onRefresh?: () => void;
}

export function EmailViewer({ emailId, userEmail, onRefresh }: EmailViewerProps) {
  const { user } = useAuth();
  
  const { data: email, isLoading, error, refetch } = useQuery({
    queryKey: ['email', emailId],
    queryFn: async () => {
      if (!user || !emailId) return null;
      
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('id', emailId)
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!emailId,
  });

  // Mark email as read when opened
  useEffect(() => {
    if (email && !email.read && user) {
      const markAsRead = async () => {
        try {
          const { error } = await supabase
            .from('emails')
            .update({ read: true })
            .eq('id', email.id)
            .eq('user_id', user.id);
            
          if (error) {
            console.error("Error marking email as read:", error);
          } else if (onRefresh) {
            // Trigger refresh of email list to update unread count
            onRefresh();
          }
        } catch (e) {
          console.error("Exception marking email as read:", e);
        }
      };
      
      markAsRead();
    }
  }, [email, user, onRefresh]);
  
  // If no email is selected or still loading
  if (!emailId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
        <MailOpen className="h-12 w-12 mb-4" />
        <p className="text-center">Select an email to view its contents</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-red-500 mb-2">Failed to load email</p>
        <p className="text-sm text-muted-foreground text-center">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    );
  }

  // Sanitize HTML content
  const sanitizedHtml = email.html_content ? DOMPurify.sanitize(email.html_content) : null;
  
  const toggleStarred = async () => {
    try {
      await supabase
        .from('emails')
        .update({ starred: !email.starred })
        .eq('id', email.id);
      
      // Refetch the email to refresh the data
      refetch();
      
      // Refresh email list if callback provided
      if (onRefresh) {
        onRefresh();
      }
      
      toast.success(`Email ${email.starred ? 'removed from' : 'added to'} favorites`);
    } catch (error) {
      console.error("Error updating starred status:", error);
      toast.error("Failed to update starred status");
    }
  };

  const handleDelete = async () => {
    try {
      await supabase
        .from('emails')
        .update({ 
          archived: true,
          folder: 'trash'
        })
        .eq('id', email.id);
      
      // Refresh email list if callback provided
      if (onRefresh) {
        onRefresh();
        toast.success("Email moved to trash");
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      toast.error("Failed to delete email");
    }
  };

  const handleArchive = async () => {
    try {
      await supabase
        .from('emails')
        .update({ 
          archived: true,
          folder: 'archive'
        })
        .eq('id', email.id);
      
      // Refresh email list if callback provided
      if (onRefresh) {
        onRefresh();
        toast.success("Email archived");
      }
    } catch (error) {
      console.error("Error archiving email:", error);
      toast.error("Failed to archive email");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-medium mb-2">{email.subject || "(No Subject)"}</h2>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium">
              {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
            </p>
            <p className="text-sm text-muted-foreground">
              To: {email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email}
            </p>
            {email.cc && email.cc.length > 0 && (
              <p className="text-sm text-muted-foreground">
                CC: {email.cc.join(', ')}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {formatDate(email.sent_at)}
            </p>
          </div>
          <div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleStarred}
              className={email.starred ? "text-yellow-400" : ""}
            >
              <Star className={email.starred ? "fill-yellow-400" : ""} />
            </Button>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Reply className="h-4 w-4" />
            <span>Reply</span>
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Forward className="h-4 w-4" />
            <span>Forward</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={handleArchive}
          >
            <Archive className="h-4 w-4" />
            <span>Archive</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        {sanitizedHtml ? (
          <div 
            className="email-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }} 
          />
        ) : (
          <div className="whitespace-pre-wrap">{email.text_content || "No content"}</div>
        )}
      </ScrollArea>
      
      {/* Simple email styling */}
      <style jsx global>{`
        .email-content img {
          max-width: 100%;
          height: auto;
        }
        
        .email-content table {
          max-width: 100%;
        }
        
        .email-content a {
          color: #0284c7;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
