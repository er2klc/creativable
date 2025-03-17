
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Reply, Forward, Trash, CornerUpRight, Download, Star, MoreVertical } from 'lucide-react';

interface EmailViewerProps {
  emailId: string | null;
  userEmail?: string;
}

export function EmailViewer({ emailId, userEmail }: EmailViewerProps) {
  // State to simulate email loading
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (emailId) {
      setIsLoading(true);
      // Simulate email loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [emailId]);

  if (!emailId) {
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div className="max-w-md space-y-2">
          <h3 className="text-xl font-medium">Keine E-Mail ausgewählt</h3>
          <p className="text-muted-foreground">
            Wählen Sie eine E-Mail aus der Liste aus, um diese anzuzeigen.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mock email data - in a real implementation, this would come from a query hook
  const email = {
    id: '1',
    from: {
      name: 'Max Mustermann',
      email: 'max@example.com',
    },
    to: [
      { name: 'Me', email: userEmail || 'me@example.com' },
    ],
    cc: [],
    bcc: [],
    subject: 'Meeting am Donnerstag',
    date: new Date(2023, 4, 15, 9, 30),
    body: `<p>Hallo,</p>
           <p>lass uns am Donnerstag um 14 Uhr treffen, um das neue Projekt zu besprechen.</p>
           <p>Hier sind die Themen, die wir abdecken sollten:</p>
           <ul>
             <li>Projektzeitplan</li>
             <li>Ressourcenplanung</li>
             <li>Budgetübersicht</li>
             <li>Risikomanagement</li>
           </ul>
           <p>Bitte bestätige mir, ob der Termin für dich passt.</p>
           <p>Viele Grüße,<br>Max</p>`,
    attachments: [
      { name: 'Projektübersicht.pdf', size: '2.4 MB', type: 'application/pdf' },
      { name: 'Meetingnotizen.docx', size: '1.1 MB', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    ],
  };

  return (
    <div className="flex flex-col h-full">
      {/* Email header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">{email.subject}</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{email.from.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <p className="font-medium">{email.from.name}</p>
              <span className="text-sm text-muted-foreground">
                {email.date.toLocaleString('de-DE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              An: {email.to.map(recipient => recipient.name).join(', ')}
            </p>
            
            {email.cc.length > 0 && (
              <p className="text-sm text-muted-foreground">
                CC: {email.cc.map(recipient => recipient.name).join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Email actions */}
      <div className="p-2 border-b flex gap-2">
        <Button variant="outline" size="sm">
          <Reply className="h-4 w-4 mr-2" />
          Antworten
        </Button>
        <Button variant="outline" size="sm">
          <CornerUpRight className="h-4 w-4 mr-2" />
          Allen antworten
        </Button>
        <Button variant="outline" size="sm">
          <Forward className="h-4 w-4 mr-2" />
          Weiterleiten
        </Button>
        <Button variant="outline" size="sm" className="ml-auto text-destructive">
          <Trash className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Email body */}
      <div className="flex-1 p-6 overflow-auto">
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: email.body }}
        />
      </div>
      
      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="p-4 border-t">
          <h3 className="text-sm font-medium mb-2">Anhänge ({email.attachments.length})</h3>
          <div className="flex flex-wrap gap-2">
            {email.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center border rounded-md p-2 bg-muted/30">
                <div className="mr-2">
                  {attachment.type.includes('pdf') ? (
                    <div className="h-8 w-8 bg-red-100 text-red-800 flex items-center justify-center rounded">PDF</div>
                  ) : attachment.type.includes('word') ? (
                    <div className="h-8 w-8 bg-blue-100 text-blue-800 flex items-center justify-center rounded">DOC</div>
                  ) : (
                    <div className="h-8 w-8 bg-gray-100 flex items-center justify-center rounded">FILE</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.name}</p>
                  <p className="text-xs text-muted-foreground">{attachment.size}</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
