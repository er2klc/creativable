import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, UserPlus } from "lucide-react";
import { CreateTeamDialog } from "../CreateTeamDialog";
import { InviteTeamMemberDialog } from "../InviteTeamMemberDialog";
import { useState } from "react";

interface TeamActionsProps {
  teamId: string;
  isAdmin: boolean;
  isOwner: boolean;
}

export function TeamActions({ teamId, isAdmin }: TeamActionsProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  if (!isAdmin) return null;

  return (
    <div className="flex items-center gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Mitglied einladen
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Teammitglied einladen</SheetTitle>
            <SheetDescription>
              Laden Sie neue Mitglieder zu Ihrem Team ein
            </SheetDescription>
          </SheetHeader>
          <InviteTeamMemberDialog teamId={teamId} />
        </SheetContent>
      </Sheet>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Kategorie erstellen
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Neue Kategorie</SheetTitle>
            <SheetDescription>
              Erstellen Sie eine neue Kategorie für Ihr Team
            </SheetDescription>
          </SheetHeader>
          <CreateTeamDialog />
        </SheetContent>
      </Sheet>
    </div>
  );
}