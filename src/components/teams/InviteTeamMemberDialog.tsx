import { useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Search, Mail } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

interface InviteTeamMemberDialogProps {
  teamId: string;
  onInviteSent?: () => void;
}

export const InviteTeamMemberDialog = ({ teamId, onInviteSent }: InviteTeamMemberDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [email, setEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const user = useUser();

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email')
        .textSearch('email', query)
        .limit(5);

      if (error) throw error;
      setSearchResults(profiles || []);
    } catch (error: any) {
      console.error("Error searching users:", error);
    }
  };

  const handleInvite = async () => {
    if (!user) {
      toast.error("Sie müssen eingeloggt sein, um Mitglieder einzuladen");
      return;
    }

    if (!email.trim()) {
      toast.error("Bitte geben Sie eine E-Mail-Adresse ein");
      return;
    }
    
    try {
      setIsLoading(true);

      // First get the user's registration_company_name from settings
      const { data: adminData, error: adminError } = await supabase
        .from('settings')
        .select('registration_company_name')
        .eq('user_id', user.id)
        .single();

      if (adminError) throw adminError;

      const { error } = await supabase
        .from("team_invites")
        .insert({
          team_id: teamId,
          email: email.trim(),
          invited_by: user.id,
          admin_name: adminData?.registration_company_name || user.email
        });

      if (error) throw error;

      toast.success("Einladung erfolgreich gesendet");
      setIsOpen(false);
      setEmail("");
      setShowEmailInput(false);
      onInviteSent?.();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error("Fehler beim Senden der Einladung");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Mitglied einladen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team-Mitglied einladen</DialogTitle>
          <DialogDescription>
            Laden Sie neue Mitglieder per Benutzername oder E-Mail ein.
          </DialogDescription>
        </DialogHeader>

        {!showEmailInput ? (
          <>
            <Command className="rounded-lg border shadow-md">
              <CommandInput 
                placeholder="Nach Benutzern suchen..." 
                value={searchTerm}
                onValueChange={(value) => {
                  setSearchTerm(value);
                  searchUsers(value);
                }}
              />
              <CommandEmpty>Keine Benutzer gefunden.</CommandEmpty>
              <CommandGroup>
                {searchResults.map((result) => (
                  <CommandItem
                    key={result.id}
                    onSelect={() => {
                      setEmail(result.email);
                      setShowEmailInput(true);
                    }}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {result.email}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
            <Button
              variant="outline"
              onClick={() => setShowEmailInput(true)}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              Per E-Mail einladen
            </Button>
          </>
        ) : (
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              E-Mail-Adresse
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="beispiel@email.com"
            />
          </div>
        )}

        <DialogFooter>
          {showEmailInput && (
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailInput(false);
                setEmail("");
              }}
              className="mr-2"
            >
              Zurück zur Suche
            </Button>
          )}
          <Button
            onClick={handleInvite}
            disabled={!email.trim() || isLoading}
          >
            {isLoading ? "Sende..." : "Einladung senden"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};