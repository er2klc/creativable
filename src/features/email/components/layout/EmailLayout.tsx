import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Inbox, Send, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailLayoutProps {
  userEmail?: string;
}

export function EmailLayout({ userEmail }: EmailLayoutProps) {
  return (
    <div className="flex h-full bg-background">
      {/* Email Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">E-Mail</h2>
          {userEmail && (
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          )}
        </div>
        
        <div className="p-2">
          <Button variant="ghost" className="w-full justify-start mb-1">
            <Inbox className="mr-2 h-4 w-4" />
            Posteingang
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-1">
            <Send className="mr-2 h-4 w-4" />
            Gesendet
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-1">
            <Archive className="mr-2 h-4 w-4" />
            Archiv
          </Button>
          <Button variant="ghost" className="w-full justify-start mb-1">
            <Trash2 className="mr-2 h-4 w-4" />
            Papierkorb
          </Button>
        </div>
      </div>

      {/* Main Email Area */}
      <div className="flex-1 flex flex-col">
        {/* Email List/Content Area */}
        <div className="flex-1 p-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Posteingang
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Keine E-Mails verfügbar</p>
                <p className="text-muted-foreground">
                  E-Mails werden hier angezeigt, sobald sie synchronisiert sind.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}