import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CreateTeamDialog } from "../CreateTeamDialog";

interface TeamActionsProps {
  teamId: string;
  isAdmin: boolean;
  isOwner: boolean;
}

export function TeamActions({ teamId, isAdmin }: TeamActionsProps) {
  if (!isAdmin) return null;

  return (
    <div className="flex items-center justify-end w-full">
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