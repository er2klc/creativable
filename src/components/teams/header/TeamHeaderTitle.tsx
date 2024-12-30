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
    <div className="flex items-center gap-6">
      <Sheet>
        <SheetTrigger asChild>
          <button className="relative group">
            {team.logo_url ? (
              <Avatar className="h-32 w-32 cursor-pointer border-2 border-primary/20">
                <AvatarImage src={team.logo_url} alt={team.name} className="object-cover" />
                <AvatarFallback className="text-2xl">{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-32 w-32 cursor-pointer border-2 border-primary/20">
                <AvatarFallback className="text-2xl">{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            {isAdmin && (
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Image className="h-8 w-8 text-white" />
              </div>
            )}
          </button>
        </SheetTrigger>
        {isAdmin && (
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
        )}
      </Sheet>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {team.name}
          </h1>
        </div>
        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
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