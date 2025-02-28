
import React, { useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { Card, CardContent } from "@/components/ui/card";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  MailIcon, 
  Inbox, 
  SendIcon, 
  Archive, 
  Trash2, 
  Search, 
  RefreshCw, 
  Plus, 
  Star, 
  AlertCircle, 
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// Types for our email data structure
interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  html_body?: string;
  read: boolean;
  starred: boolean;
  important: boolean;
  received_at: string;
  user_id: string;
  folder: string;
  has_attachments: boolean;
}

// Mock data for initial UI development
const mockFolders = [
  { id: "inbox", name: "Inbox", icon: <Inbox className="h-4 w-4" />, count: 12 },
  { id: "sent", name: "Sent", icon: <SendIcon className="h-4 w-4" />, count: 0 },
  { id: "archive", name: "Archive", icon: <Archive className="h-4 w-4" />, count: 0 },
  { id: "trash", name: "Trash", icon: <Trash2 className="h-4 w-4" />, count: 0 },
];

const mockEmails: EmailMessage[] = [
  {
    id: "1",
    subject: "Welcome to the new mail system",
    from: "system@example.com",
    to: "user@example.com",
    body: "We're excited to welcome you to the new mail system. This is a simple plain text email.",
    html_body: "<h1>Welcome!</h1><p>We're excited to welcome you to the new mail system.</p>",
    read: false,
    starred: false,
    important: true,
    received_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    user_id: "user1",
    folder: "inbox",
    has_attachments: false,
  },
  {
    id: "2",
    subject: "Your account statement",
    from: "bank@example.com",
    to: "user@example.com",
    body: "Your monthly account statement is ready to view.",
    html_body: "<h2>Statement Ready</h2><p>Your monthly account statement is ready to view.</p>",
    read: true,
    starred: true,
    important: false,
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    user_id: "user1",
    folder: "inbox",
    has_attachments: true,
  },
  {
    id: "3",
    subject: "Team meeting tomorrow",
    from: "manager@example.com",
    to: "user@example.com",
    body: "Reminder that we have a team meeting scheduled for tomorrow at 10am.",
    html_body: "<p>Reminder that we have a team meeting scheduled for tomorrow at <strong>10am</strong>.</p>",
    read: true,
    starred: false,
    important: true,
    received_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    user_id: "user1",
    folder: "inbox",
    has_attachments: false,
  },
];

// Email folder sidebar component
const MailFolderList = ({ 
  folders, 
  selectedFolder, 
  onSelectFolder 
}: { 
  folders: typeof mockFolders, 
  selectedFolder: string, 
  onSelectFolder: (folder: string) => void 
}) => {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Folders</h2>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-1">
        {folders.map((folder) => (
          <Button
            key={folder.id}
            variant={selectedFolder === folder.id ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => onSelectFolder(folder.id)}
          >
            <span className="flex items-center">
              {folder.icon}
              <span className="ml-2">{folder.name}</span>
            </span>
            {folder.count > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {folder.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

// Email list component
const MailList = ({ 
  emails, 
  selectedEmail, 
  onSelectEmail, 
  isLoading 
}: { 
  emails: EmailMessage[], 
  selectedEmail: string | null, 
  onSelectEmail: (id: string) => void, 
  isLoading: boolean 
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search emails..." className="pl-8" />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Loading emails...</p>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>No emails found</p>
          </div>
        ) : (
          <div>
            {emails.map((email) => (
              <div
                key={email.id}
                className={`p-4 border-b cursor-pointer ${
                  !email.read ? "bg-blue-50/50" : ""
                } ${selectedEmail === email.id ? "bg-blue-100/50" : ""} hover:bg-muted/50`}
                onClick={() => onSelectEmail(email.id)}
              >
                <div className="flex items-start gap-2 mb-1">
                  {!email.read && <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`truncate font-medium ${!email.read ? "text-black" : "text-muted-foreground"}`}>
                        {email.from.split('@')[0]}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDistanceToNow(new Date(email.received_at), {
                          addSuffix: false,
                          locale: de
                        })}
                      </p>
                    </div>
                    <h3 className={`text-sm ${!email.read ? "font-semibold" : "font-normal"}`}>
                      {email.subject}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {email.body.substring(0, 90)}...
                    </p>
                    <div className="flex gap-1 mt-1">
                      {email.has_attachments && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-5">
                          Attachment
                        </Badge>
                      )}
                      {email.important && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-5 bg-red-50 text-red-500 border-red-200">
                          Important
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

// Email detail view component
const MailDetail = ({ 
  email, 
  onBack 
}: { 
  email: EmailMessage | null, 
  onBack: () => void 
}) => {
  if (!email) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-center text-muted-foreground">
        <div>
          <MailIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-1">No email selected</h3>
          <p className="text-sm">Select an email from the list to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
            Back
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" title="Archive">
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-2">{email.subject}</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">{email.from}</p>
              <p className="text-sm text-muted-foreground">To: {email.to}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(email.received_at).toLocaleString('de-DE')}
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="prose max-w-none dark:prose-invert">
            {email.html_body ? (
              <div dangerouslySetInnerHTML={{ __html: email.html_body }} />
            ) : (
              <p className="whitespace-pre-line">{email.body}</p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

// Main Mail component
const Mail = () => {
  const { settings } = useSettings();
  const isEnglish = settings?.language === "en";
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Email configuration status check
  const { data: emailConfigured, isLoading: checkingConfig } = useQuery({
    queryKey: ["email-configuration"],
    queryFn: async () => {
      const { data: imapSettings } = await supabase
        .from("imap_settings")
        .select("*")
        .maybeSingle();
        
      const { data: smtpSettings } = await supabase
        .from("smtp_settings")
        .select("*")
        .maybeSingle();
        
      return !!(imapSettings?.host && smtpSettings?.host);
    },
  });

  // This would be replaced with actual email fetching from the database
  const { data: emails = mockEmails, isLoading: loadingEmails } = useQuery({
    queryKey: ["emails", selectedFolder],
    queryFn: async () => {
      // For now, return mock data filtered by folder
      // This would be replaced with a real API call
      if (!emailConfigured) return [];
      
      return mockEmails.filter(email => email.folder === selectedFolder);
    },
    enabled: !!emailConfigured,
  });

  const selectedEmailData = emails.find(email => email.id === selectedEmail) || null;
  
  const handleSyncMails = () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncProgress(0);
    
    // Simulate progress for now
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsSyncing(false);
          toast.success("Email synchronization complete");
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  // UI for when email is not configured
  if (!emailConfigured && !checkingConfig) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">
          {isEnglish ? "Mail" : "E-Mail"}
        </h1>
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {isEnglish ? "Email Not Configured" : "E-Mail nicht konfiguriert"}
              </h2>
              <p className="text-gray-500 mb-4 text-center max-w-md">
                {isEnglish
                  ? "Your email account needs to be configured before you can send or receive emails."
                  : "Ihr E-Mail-Konto muss konfiguriert werden, bevor Sie E-Mails senden oder empfangen können."}
              </p>
              <Button onClick={() => window.location.href = "/settings"}>
                {isEnglish ? "Configure Email Settings" : "E-Mail-Einstellungen konfigurieren"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (checkingConfig) {
    return (
      <div className="container py-6">
        <h1 className="text-2xl font-bold mb-6">
          {isEnglish ? "Mail" : "E-Mail"}
        </h1>
        <Card>
          <CardContent className="p-6 flex justify-center">
            <div className="flex flex-col items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mb-4" />
              <p>{isEnglish ? "Checking email configuration..." : "E-Mail-Konfiguration wird überprüft..."}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main email interface
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEnglish ? "Mail" : "E-Mail"}</h1>
        <div className="flex space-x-2">
          <Button onClick={handleSyncMails} disabled={isSyncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
            {isEnglish ? "Sync Mails" : "E-Mails synchronisieren"}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {isEnglish ? "Compose" : "Verfassen"}
          </Button>
        </div>
      </div>

      {isSyncing && (
        <Alert className="mb-4">
          <AlertDescription className="flex flex-col">
            <div className="flex items-center mb-2">
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              <span>{isEnglish ? "Syncing emails..." : "E-Mails werden synchronisiert..."} {syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-200px)]">
          {/* Folders panel */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="border-r">
            <MailFolderList 
              folders={mockFolders} 
              selectedFolder={selectedFolder} 
              onSelectFolder={setSelectedFolder} 
            />
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Email list panel */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <MailList 
              emails={emails} 
              selectedEmail={selectedEmail} 
              onSelectEmail={setSelectedEmail} 
              isLoading={loadingEmails} 
            />
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Email detail panel */}
          <ResizablePanel defaultSize={50}>
            <MailDetail 
              email={selectedEmailData} 
              onBack={() => setSelectedEmail(null)} 
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </div>
  );
};

export default Mail;
