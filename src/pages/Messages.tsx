import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Trash2
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

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
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Ihre E-Mail-Adresse"
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
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="E-Mail Inhalt..."
              className="min-h-[300px]"
            />
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
            <Button>
              Senden
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Messages = () => {
  const { settings } = useSettings();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<EmailFolder>("inbox");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);

  const { data: allEmails = [], isLoading } = useQuery({
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
      <div className="border-b p-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="E-Mails durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-64 bg-gray-100 p-4 space-y-4">
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => setIsComposeOpen(true)}
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
