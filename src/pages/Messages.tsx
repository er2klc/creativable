import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  MoreHorizontal, 
  Mail, 
  UserCircle2, 
  Tag, 
  Archive,
  ChevronDown,
  FileText,
  SendHorizonal,
  Inbox,
  MailX,
  Search,
  Check,
  Trash2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { HeaderActions } from "@/components/layout/HeaderActions";
import { useAuth } from "@/hooks/use-auth";
import { Progress } from "@/components/ui/progress";

type EmailFolder = "inbox" | "drafts" | "outbox" | "sent" | "archive";

interface FolderItem {
  id: EmailFolder;
  name: string;
  icon: React.ComponentType<any>;
}

const folders: FolderItem[] = [
  { id: "inbox", name: "Eingang", icon: Inbox },
  { id: "drafts", name: "Entwürfe", icon: FileText },
  { id: "outbox", name: "Ausgang", icon: MailX },
  { id: "sent", name: "Gesendet", icon: SendHorizonal },
  { id: "archive", name: "Archiv", icon: Archive },
];

interface EmailTableProps {
  emails: any[];
  onMatchContact?: (emailId: string) => void;
}

const EmailTable = ({ 
  emails, 
  onMatchContact,
  selectedEmails,
  onSelectEmail 
}: EmailTableProps & { 
  selectedEmails: string[];
  onSelectEmail: (emailId: string, isSelected: boolean) => void;
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30px]">
            <Checkbox />
          </TableHead>
          <TableHead className="w-[300px]">Von</TableHead>
          <TableHead>Betreff</TableHead>
          <TableHead>Empfangen</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emails.map((email) => (
          <TableRow key={email.id} className={selectedEmails.includes(email.id) ? "bg-muted" : ""}>
            <TableCell>
              <Checkbox 
                checked={selectedEmails.includes(email.id)}
                onCheckedChange={(checked) => onSelectEmail(email.id, checked as boolean)}
              />
            </TableCell>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {email.from_email}
              </div>
            </TableCell>
            <TableCell>{email.subject}</TableCell>
            <TableCell>
              {format(new Date(email.created_at), 'Pp', { 
                locale: email.language === 'en' ? enUS : de 
              })}
            </TableCell>
            <TableCell>
              {email.lead_id ? (
                <Badge variant="outline" className="bg-green-50">
                  Zugewiesen
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 cursor-pointer" onClick={() => onMatchContact?.(email.id)}>
                  Nicht zugewiesen
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon">
                  <UserCircle2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Tag className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Archive className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const ComposeDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { data: smtpSettings } = useQuery({
    queryKey: ['smtp-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smtp_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  useEffect(() => {
    if (smtpSettings) {
      setFrom(smtpSettings.from_email);
    }
  }, [smtpSettings]);

  const handleSendEmail = async () => {
    if (!smtpSettings) {
      toast.error("Bitte zuerst SMTP-Einstellungen konfigurieren");
      return;
    }

    if (!to || !subject || !content) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: to,
          subject: subject,
          html: content,
          from_email: smtpSettings.from_email,
          from_name: smtpSettings.from_name
        },
      });

      if (error) throw error;

      setTo("");
      setSubject("");
      setContent("");
      toast.success("E-Mail wurde erfolgreich gesendet");
      onClose();
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Fehler beim Senden der E-Mail");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Neue E-Mail</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2">
            <label className="w-20">Von:</label>
            <Input 
              value={from}
              readOnly
              className="bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-20">An:</label>
            <Input 
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Empfänger E-Mail-Adresse"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="w-20">Betreff:</label>
            <Input 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="E-Mail Betreff"
            />
          </div>
          <div className="border-t pt-4">
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm">
                Vorlage wählen
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Feld einfügen
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Meetingplaner
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="border rounded-lg">
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="E-Mail Inhalt..."
                editorProps={{
                  attributes: {
                    class: "min-h-[300px] p-4"
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Mail className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Tag className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={isSending || !smtpSettings}
            >
              {isSending ? "Wird gesendet..." : "Senden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const NoSmtpWarning = () => {
  return (
    <Card className="border-yellow-200 bg-yellow-50 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5" />
          SMTP-Einstellungen erforderlich
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">
          Um E-Mails senden und empfangen zu können, müssen Sie zuerst Ihre SMTP-Einstellungen konfigurieren.
        </p>
        <div className="space-y-2">
          <p className="text-sm">Sie benötigen folgende Informationen:</p>
          <ul className="list-disc list-inside text-sm">
            <li>SMTP-Server-Adresse</li>
            <li>Port-Nummer</li>
            <li>Benutzername</li>
            <li>Passwort</li>
            <li>Absender E-Mail-Adresse</li>
          </ul>
        </div>
        <Button 
          className="mt-4"
          asChild
        >
          <Link to="/settings?tab=smtp">
            SMTP-Einstellungen konfigurieren
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

const Messages = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<EmailFolder>("inbox");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: smtpSettings } = useQuery({
    queryKey: ['smtp-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smtp_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: imapSettings } = useQuery({
    queryKey: ['imap-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('imap_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });

  const { data: allEmails = [], isLoading, refetch } = useQuery({
    queryKey: ['emails', selectedFolder],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('emails')
        .select(`
          *,
          leads (
            id,
            name,
            platform
          )
        `)
        .eq('user_id', user.id)
        .eq('folder', selectedFolder)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleRefreshEmails = async () => {
    setIsRefreshing(true);
    setIsSyncing(true);
    setSyncProgress(10);

    try {
      await refetch();
      setSyncProgress(30);
      
      const { data, error } = await supabase.functions.invoke('sync-emails', {
        body: { 
          force_refresh: true 
        }
      });
      
      setSyncProgress(70);
      
      if (error) {
        throw error;
      }
      
      if (data && data.success) {
        await refetch();
        setSyncProgress(100);
        
        if (data.emailsCount && data.emailsCount > 0) {
          toast.success(`${data.emailsCount} neue E-Mails wurden synchronisiert`);
        } else {
          toast.info("Keine neuen E-Mails gefunden");
        }
      } else {
        const errorMsg = data?.error || data?.details || data?.message || "Unbekannter Fehler";
        console.error("Email sync error details:", data);
        toast.error(`Fehler bei der E-Mail-Synchronisation: ${errorMsg}`);
        
        if (data?.details && data?.message && data.details !== data.message) {
          setTimeout(() => {
            toast.error(`Details: ${data.details}`, { duration: 6000 });
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error refreshing emails:", error);
      toast.error(`Fehler beim Aktualisieren der E-Mails: ${error.message}`);
      setSyncProgress(0);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 1000);
    }
  };

  const filteredEmails = allEmails.filter(email => {
    const searchLower = searchQuery.toLowerCase();
    return (
      email.from_email.toLowerCase().includes(searchLower) ||
      email.subject.toLowerCase().includes(searchLower) ||
      email.content?.toLowerCase().includes(searchLower)
    );
  });

  const handleMatchContact = async (emailId: string) => {
    toast.info("Kontakt-Matching wird implementiert...");
  };

  const handleSelectEmail = (emailId: string, isSelected: boolean) => {
    setSelectedEmails(prev => 
      isSelected 
        ? [...prev, emailId]
        : prev.filter(id => id !== emailId)
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="fixed top-0 left-0 right-0 z-[40] bg-white border-b border-sidebar-border md:left-[72px] md:group-hover:left-[240px] transition-[left] duration-300">
        <div className="h-16 px-4 flex items-center">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <h1 className="text-lg md:text-xl font-semibold text-foreground">
                E-Mail
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="E-Mails durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefreshEmails}
                disabled={isRefreshing || !imapSettings}
                className="ml-2"
                title={imapSettings ? "E-Mails aktualisieren" : "IMAP-Einstellungen erforderlich"}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <HeaderActions profile={null} userEmail={user?.email} />
          </div>
        </div>
        {isSyncing && (
          <div className="px-4 pb-2">
            <Progress value={syncProgress} className="h-1" indicatorClassName="bg-green-500" />
          </div>
        )}
      </div>

      <div className="flex flex-1 pt-16">
        <div className="w-64 bg-gray-100 p-4 space-y-4">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => setIsComposeOpen(true)}
            disabled={!smtpSettings}
          >
            + Neue E-Mail
          </Button>
          
          <div className="space-y-1">
            {folders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedFolder(folder.id)}
              >
                <folder.icon className="h-4 w-4 mr-2" />
                {folder.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          {!smtpSettings && <NoSmtpWarning />}
          
          {!imapSettings && (
            <Card className="border-yellow-200 bg-yellow-50 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mail className="h-5 w-5" />
                  IMAP-Einstellungen erforderlich
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  Um E-Mails empfangen zu können, müssen Sie zuerst Ihre IMAP-Einstellungen konfigurieren.
                </p>
                <div className="space-y-2">
                  <p className="text-sm">Sie benötigen folgende Informationen:</p>
                  <ul className="list-disc list-inside text-sm">
                    <li>IMAP-Server-Adresse</li>
                    <li>Port-Nummer</li>
                    <li>Benutzername</li>
                    <li>Passwort</li>
                    <li>SSL/TLS-Einstellungen</li>
                  </ul>
                </div>
                <Button 
                  className="mt-4"
                  asChild
                >
                  <Link to="/settings?tab=imap">
                    IMAP-Einstellungen konfigurieren
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">
                {folders.find(f => f.id === selectedFolder)?.name}
              </h1>
              
              <div className="flex items-center gap-2">
                {selectedEmails.length > 0 ? (
                  <>
                    <span className="text-sm text-muted-foreground">
                      {selectedEmails.length} ausgewählt
                    </span>
                    <Button variant="outline" size="sm">
                      <Check className="h-4 w-4 mr-2" />
                      Als gelesen markieren
                    </Button>
                    <Button variant="outline" size="sm">
                      <Tag className="h-4 w-4 mr-2" />
                      Label verwalten
                    </Button>
                    <Button variant="outline" size="sm">
                      <Archive className="h-4 w-4 mr-2" />
                      Archivieren
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </Button>
                  </>
                ) : (
                  <Button variant="outline">
                    <Tag className="h-4 w-4 mr-2" />
                    Labels
                  </Button>
                )}
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <EmailTable 
                  emails={filteredEmails}
                  onMatchContact={handleMatchContact}
                  selectedEmails={selectedEmails}
                  onSelectEmail={handleSelectEmail}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ComposeDialog 
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
      />
    </div>
  );
};

export default Messages;
