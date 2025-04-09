
import React from 'react';
import { useEmailViewer } from '../../hooks/useEmailViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Archive, 
  ArrowLeft, 
  Clock, 
  Download, 
  File, 
  Mail, 
  MailReply, 
  Reply, 
  Star, 
  Trash, 
  User 
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import DOMPurify from 'dompurify';

interface EmailViewerProps {
  emailId: string | null;
  userEmail?: string;
}

export function EmailViewer({ emailId, userEmail }: EmailViewerProps) {
  const { email, isLoading } = useEmailViewer(emailId);
  
  if (!emailId) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
        <Mail className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">Keine E-Mail ausgewählt</h3>
        <p>Wählen Sie eine E-Mail aus der Liste aus, um sie hier anzuzeigen.</p>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-1/3" />
          <div className="space-x-2">
            <Skeleton className="h-9 w-9 inline-block" />
            <Skeleton className="h-9 w-9 inline-block" />
            <Skeleton className="h-9 w-9 inline-block" />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
          
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          
          <div className="pt-4">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
        <Mail className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2">E-Mail nicht gefunden</h3>
        <p>Die ausgewählte E-Mail ist nicht verfügbar oder wurde gelöscht.</p>
      </div>
    );
  }
  
  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Format relative time
  const getRelativeTime = (date: Date): string => {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: de
    });
  };

  // Prepare sanitized HTML content
  const sanitizedHtml = email.html_content ? DOMPurify.sanitize(email.html_content, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      'a', 'b', 'br', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'i', 'img', 'li', 'ol', 'p', 'span', 'strong', 'table', 'tbody',
      'td', 'th', 'thead', 'tr', 'u', 'ul'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'style', 'src', 'alt', 'title', 'width', 'height',
      'colspan', 'rowspan', 'cellpadding', 'cellspacing', 'border'
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    ADD_TAGS: ['style'],
    WHOLE_DOCUMENT: false,
    SANITIZE_DOM: true
  }) : '';
  
  return (
    <div className="h-full flex flex-col">
      {/* Email toolbar */}
      <div className="p-3 border-b flex items-center justify-between">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" title="Antworten">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Archivieren">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title={email.starred ? "Unmarkieren" : "Als wichtig markieren"}>
            <Star className={email.starred ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4"} />
          </Button>
          <Button variant="ghost" size="icon" title="Löschen">
            <Trash className="h-4 w-4" />
          </Button>
          {email.has_attachments && (
            <Button variant="ghost" size="icon" title="Anhänge herunterladen">
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 p-6">
        {/* Email header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-6">{email.subject || "(Kein Betreff)"}</h2>
          
          <div className="flex items-start space-x-3">
            <Avatar>
              <AvatarFallback>
                {getInitials(email.from_name || email.from_email)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex justify-between items-baseline">
                <div>
                  <p className="font-medium">{email.from_name || email.from_email}</p>
                  <p className="text-sm text-muted-foreground">
                    <span>{email.from_email}</span>
                  </p>
                </div>
                
                <div className="text-sm text-muted-foreground flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  {getRelativeTime(email.sent_at)}
                </div>
              </div>
              
              <div className="mt-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center mr-2">
                  <User className="mr-1 h-3 w-3" />
                  An:
                </span>
                {email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email || userEmail}
              </div>
              
              {email.has_attachments && (
                <div className="mt-2">
                  <div className="inline-flex items-center py-1 px-2 bg-muted rounded-md text-sm">
                    <File className="h-3 w-3 mr-1" />
                    <span>Diese E-Mail enthält Anhänge</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Email content */}
        <div className="mb-6 border-t pt-6">
          {email.html_content ? (
            <div className="email-content prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
          ) : (
            <pre className="whitespace-pre-wrap font-sans">{email.text_content || email.content || "Kein Inhalt"}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
