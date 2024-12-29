import { Crown, Image, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TeamMemberList } from "./TeamMemberList";
import { TeamAdminList } from "./TeamAdminList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamHeaderTitleProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  isAdmin: boolean;
  membersCount: number;
  adminsCount: number;
  members: any[];
  adminMembers: any[];
}

export function TeamHeaderTitle({ 
  team, 
  isAdmin, 
  membersCount, 
  adminsCount,
  members,
  adminMembers 
}: TeamHeaderTitleProps) {
  return (
    <div className="flex items-center gap-4">
      {team.logo_url ? (
        <Avatar className="h-12 w-12">
          <AvatarImage src={team.logo_url} alt={team.name} />
          <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="h-12 w-12">
          <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold text-primary">
            {team.name}
          </h1>
          {isAdmin && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Image className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Team Logo ändern</SheetTitle>
                  <SheetDescription>
                    Laden Sie ein neues Logo für Ihr Team hoch
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <TeamLogoUpload teamId={team.id} currentLogoUrl={team.logo_url} />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
        <div className="flex items-center gap-4 mt-1 text-muted-foreground">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{membersCount} Mitglieder</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Team Mitglieder</SheetTitle>
                <SheetDescription>
                  Übersicht aller Mitglieder in diesem Team
                </SheetDescription>
              </SheetHeader>
              <TeamMemberList members={members} isAdmin={isAdmin} />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Crown className="h-4 w-4" />
                <span>{adminsCount} Admins</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Team Administratoren</SheetTitle>
                <SheetDescription>
                  Übersicht aller Administratoren in diesem Team
                </SheetDescription>
              </SheetHeader>
              <TeamAdminList admins={adminMembers} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}