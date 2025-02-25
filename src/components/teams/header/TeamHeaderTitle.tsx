
import { Crown, Image, Users, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TeamMemberList } from "./TeamMemberList";
import { TeamAdminList } from "./TeamAdminList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAvatarUrl } from "@/lib/supabase-utils";
import { useTeamStats } from "@/hooks/useTeamStats";
import { ErrorBoundary } from "react-error-boundary";

interface TeamHeaderTitleProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  isAdmin: boolean;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-sm text-muted-foreground">
      <Button variant="ghost" onClick={resetErrorBoundary}>Neu laden</Button>
    </div>
  );
}

export function TeamHeaderTitle({ team, isAdmin }: TeamHeaderTitleProps) {
  const { 
    stats, 
    members, 
    adminMembers,
    isLoading,
    refetch,
    error 
  } = useTeamStats(team.id);

  if (isLoading) {
    return (
      <div className="flex items-center gap-6 justify-center w-full animate-pulse">
        <div className="h-32 w-32 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => refetch()}
    >
      <div className="flex items-center gap-6 justify-center w-full">
        <Sheet>
          <SheetTrigger asChild>
            <button className="relative group">
              <Avatar className="h-32 w-32 cursor-pointer border-2 border-primary/20">
                <AvatarImage 
                  src={team.logo_url ? getAvatarUrl(team.logo_url) : undefined} 
                  alt={team.name} 
                  className="object-cover" 
                />
                <AvatarFallback className="text-2xl bg-primary/5">
                  {team.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
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
                <TeamLogoUpload currentLogoUrl={team.logo_url} />
              </div>
            </SheetContent>
          )}
        </Sheet>
        <div>
          <h1 className="text-4xl font-semibold">{team.name}</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{stats.totalMembers} Mitglieder</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Team Mitglieder</SheetTitle>
                  <SheetDescription>Übersicht aller Mitglieder in diesem Team</SheetDescription>
                </SheetHeader>
                <TeamMemberList members={members} isAdmin={isAdmin} />
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Crown className="h-4 w-4" />
                  <span>{stats.admins} Admins</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Team Administratoren</SheetTitle>
                  <SheetDescription>Übersicht aller Administratoren in diesem Team</SheetDescription>
                </SheetHeader>
                <TeamAdminList admins={adminMembers} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
