
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Mail, UserCircle2, Tag, Archive } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { format } from "date-fns";
import { de, enUS } from "date-fns/locale";

interface EmailTableProps {
  emails: any[];
  onMatchContact?: (emailId: string) => void;
}

const EmailTable = ({ emails, onMatchContact }: EmailTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Von</TableHead>
          <TableHead>Betreff</TableHead>
          <TableHead>Empfangen</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {emails.map((email) => (
          <TableRow key={email.id}>
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

const Messages = () => {
  const { settings } = useSettings();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  const { data: emails = [], isLoading } = useQuery({
    queryKey: ['emails'],
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
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleMatchContact = async (emailId: string) => {
    // Implementieren Sie hier die Kontakt-Matching-Logik
    toast.info("Kontakt-Matching wird implementiert...");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {settings?.language === "en" ? "Emails" : "E-Mails"}
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Neue E-Mail
          </Button>
          <Button variant="outline">
            <Tag className="h-4 w-4 mr-2" />
            Labels
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {settings?.language === "en" ? "All Emails" : "Alle E-Mails"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EmailTable 
            emails={emails} 
            onMatchContact={handleMatchContact}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
