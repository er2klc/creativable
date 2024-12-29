import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TeamMemberList } from "./TeamMemberList";

interface TeamManagementButtonProps {
  isAdmin: boolean;
  members: any[];
}

export function TeamManagementButton({ isAdmin, members }: TeamManagementButtonProps) {
  if (!isAdmin) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Settings className="h-4 w-4 mr-2" />
          Mitglieder verwalten
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Mitgliederverwaltung</SheetTitle>
          <SheetDescription>
            Hier können Sie Mitgliederrollen verwalten und neue Admins ernennen.
          </SheetDescription>
        </SheetHeader>
        <TeamMemberList members={members} isAdmin={isAdmin} />
      </SheetContent>
    </Sheet>
  );
}