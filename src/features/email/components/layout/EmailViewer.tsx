import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import { Loader2, AlertCircle, Star, StarOff, MailOpen, Paperclip, ArrowLeft, ArrowRight, Trash, Reply, Forward, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface EmailViewerProps {
  emailId: string | null;
  userEmail?: string;
}

interface Attachment {
  id: string;
  email_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_content?: string;
  content_id?: string;
}

export function EmailViewer({ emailId, userEmail }: EmailViewerProps) {
  const { user } = useAuth();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [showAttachments, setShowAttachments] = useState(false);
  
  const { data: email, isLoading, error, refetch } = useQuery({
    queryKey: ['email', emailId],
    queryFn: async () => {
      if (!user || !emailId) return null;
      
      try {
        const { data, error } = await supabase
          .from('emails')
          .select('*')
          .eq('id', emailId)
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        return data;
      } catch (err) {
        console.error('Error fetching email:', err);
        toast.error("Failed to load email", {
          description: "There was an error loading this email. Please try again."
        });
        return null;
      }
    },
    enabled: !!user && !!emailId,
  });
  
  // Abfrage der E-Mail-Anhänge
  const { data: attachments, isLoading: isLoadingAttachments } = useQuery({
    queryKey: ['email-attachments', emailId],
    queryFn: async () => {
      if (!user || !emailId || !email?.has_attachments) return [];
      
      try {
        const { data, error } = await supabase
          .from('email_attachments')
          .select('*')
          .eq('email_id', emailId);
        
        if (error) throw error;
        return data as Attachment[];
      } catch (err) {
        console.error('Error fetching email attachments:', err);
        return [];
      }
    },
    enabled: !!user && !!emailId && !!email?.has_attachments,
  });
  
  // Mark email as read when opened
  useEffect(() => {
    if (user && emailId && email && !email.read) {
      supabase
        .from('emails')
        .update({ read: true })
        .eq('id', emailId)
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Error marking email as read:', error);
          } else {
            // Refresh the email list to update the unread count
            refetch();
          }
        });
    }
  }, [user, emailId, email, refetch]);
  
  // Process HTML content for safe display
  useEffect(() => {
    if (email?.html_content) {
      // Sanitize HTML to prevent XSS
      const sanitizedHtml = DOMPurify.sanitize(email.html_content, {
        ADD_ATTR: ['target'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'frame', 'object', 'embed']
      });
      setHtmlContent(sanitizedHtml);
    } else {
      setHtmlContent('');
    }
  }, [email]);
  
  // Download attachment function
  const downloadAttachment = async (attachment: Attachment) => {
    try {
      if (!attachment.file_content) {
        // Falls der Inhalt nicht in der Datenbank gespeichert ist, müssen wir ihn abrufen
        const { data, error } = await supabase
          .from('email_attachments')
          .select('file_content')
          .eq('id', attachment.id)
          .single();
          
        if (error || !data.file_content) {
          throw new Error('Anhang konnte nicht geladen werden');
        }
        
        attachment.file_content = data.file_content;
      }
      
      // Base64-Inhalt in Blob konvertieren
      const byteCharacters = atob(attachment.file_content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachment.file_type });
      
      // Download-Link erstellen und klicken
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      
      toast.success(`Anhang "${attachment.file_name}" wird heruntergeladen`);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      toast.error("Fehler beim Herunterladen des Anhangs");
    }
  };
  
  // Toggle starred status
  const toggleStarred = async () => {
    if (!user || !emailId) return;
    
    try {
      const { error } = await supabase
        .from('emails')
        .update({ starred: !email?.starred })
        .eq('id', emailId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      refetch();
    } catch (err) {
      console.error('Error toggling starred status:', err);
      toast.error("Failed to update star status");
    }
  };
  
  // Handle moving email to trash
  const moveToTrash = async () => {
    if (!user || !emailId) return;
    
    try {
      const { error } = await supabase
        .from('emails')
        .update({ folder: 'Trash' })
        .eq('id', emailId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success("Email moved to trash");
      // Navigate back to inbox or refresh
    } catch (err) {
      console.error('Error moving email to trash:', err);
      toast.error("Failed to move email to trash");
    }
  };
  
  if (!emailId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-muted-foreground">
        <MailOpen className="h-16 w-16 mb-4 text-muted-foreground/30" />
        <h3 className="text-lg font-medium mb-2">No Email Selected</h3>
        <p className="text-center text-sm">
          Select an email from the list to view its contents
        </p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !email) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-destructive">
        <AlertCircle className="h-16 w-16 mb-4" />
        <h3 className="text-lg font-medium mb-2">Error Loading Email</h3>
        <p className="text-center text-sm mb-4">
          There was a problem loading this email
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  const isCurrentUserSender = email.from_email === userEmail;
  
  return (
    <div className="flex flex-col h-full">
      {/* Email Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-semibold">{email.subject || "(No Subject)"}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleStarred}>
              {email.starred ? (
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-5 w-5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={moveToTrash}>
              <Trash className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-1">
              <span className="font-medium">{email.from_name || email.from_email}</span>
              {email.from_name && (
                <span className="text-sm text-muted-foreground ml-2">&lt;{email.from_email}&gt;</span>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              To: {email.to_name || email.to_email}
              {email.to_name && <span>&lt;{email.to_email}&gt;</span>}
            </div>
            {email.cc && email.cc.length > 0 && (
              <div className="text-sm text-muted-foreground">
                CC: {email.cc.join(', ')}
              </div>
            )}
            <div className="text-sm text-muted-foreground mt-1">
              {format(new Date(email.sent_at), 'PPpp')}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2 ml-4">
            {email.has_attachments && (
              <Badge 
                variant="outline" 
                className="flex items-center cursor-pointer"
                onClick={() => setShowAttachments(!showAttachments)}
              >
                <Paperclip className="h-3 w-3 mr-1" />
                Attachments ({attachments?.length || '...'})
              </Badge>
            )}
          </div>
        </div>
        
        {/* Anhänge-Bereich */}
        {showAttachments && attachments && attachments.length > 0 && (
          <div className="mt-4 p-3 bg-muted/20 rounded-md">
            <h4 className="text-sm font-medium mb-2">Anhänge</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="flex items-center justify-between p-2 bg-background rounded border"
                >
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate" title={attachment.file_name}>
                      {attachment.file_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({Math.round(attachment.file_size / 1024)} KB)
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="ml-2 flex-shrink-0"
                    onClick={() => downloadAttachment(attachment)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {isLoadingAttachments && showAttachments && (
          <div className="mt-4 p-3 bg-muted/20 rounded-md flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm ml-2">Anhänge werden geladen...</span>
          </div>
        )}
      </div>
      
      {/* Email Actions */}
      <div className="flex items-center px-4 py-2 border-b">
        <Button variant="ghost" size="sm" className="mr-2">
          <Reply className="h-4 w-4 mr-2" />
          Reply
        </Button>
        <Button variant="ghost" size="sm">
          <Forward className="h-4 w-4 mr-2" />
          Forward
        </Button>
        <div className="ml-auto flex items-center">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Email Content */}
      <ScrollArea className="flex-grow">
        <div className="p-4">
          {htmlContent ? (
            <div 
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <div className="whitespace-pre-wrap">{email.text_content || "No content"}</div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
